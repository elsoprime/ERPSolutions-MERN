/**
 * Custom Hook: useCreateCompanyForm
 * @description: Hook personalizado que encapsula toda la lógica del formulario de creación de empresas
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 1.0.0
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import {
  CreateCompanyFormData,
  createCompanySchema,
  defaultCompanyFormValues,
} from "@/schemas/EnhancedCompanySchemas";
import { IPlan } from "@/interfaces/Plan/IPlan";
import { IEnhancedCompany } from "@/interfaces/EnhanchedCompany/EnhancedCompany";
import EnhancedCompanyAPI from "@/api/EnhancedCompanyAPI";
import PlanAPI from "@/api/PlanAPI";

/**
 * Tipo de pasos del formulario
 */
export type FormStep = 1 | 2 | 3 | 4;

/**
 * Resultado de validación de un paso
 */
export interface StepValidationResult {
  isValid: boolean;
  missingFields: string[];
}

/**
 * Props del hook
 */
export interface UseCreateCompanyFormProps {
  onSuccess: (company: IEnhancedCompany) => void;
  onError?: (error: Error) => void;
  initialValues?: Partial<CreateCompanyFormData>;
}

/**
 * Custom Hook para manejar el formulario de creación de empresas
 */
export function useCreateCompanyForm({
  onSuccess,
  onError,
  initialValues,
}: UseCreateCompanyFormProps) {
  // Estados del formulario
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [slugPreview, setSlugPreview] = useState("");
  const [isCurrentStepValid, setIsCurrentStepValid] = useState(false);
  const [validationInProgress, setValidationInProgress] = useState(false);

  // Estados para planes
  const [availablePlans, setAvailablePlans] = useState<IPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");

  // React Hook Form
  const {
    register,
    handleSubmit: rhfHandleSubmit,
    watch,
    formState: { errors },
    setValue,
    getValues,
    reset,
    trigger,
  } = useForm<CreateCompanyFormData>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: initialValues || defaultCompanyFormValues,
    mode: "onChange",
  });

  // Cargar planes disponibles
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setPlansLoading(true);
        const response = await PlanAPI.getActivePlans();

        if (response.success && response.data) {
          setAvailablePlans(response.data);
        } else {
          console.error("Error al cargar planes:", response.message);
          setAvailablePlans([]);
        }
      } catch (error) {
        console.error("Error al cargar planes:", error);
        setAvailablePlans([]);
      } finally {
        setPlansLoading(false);
      }
    };
    loadPlans();
  }, []);

  // Generar slug automáticamente desde el nombre
  const watchedName = watch("name");
  useEffect(() => {
    if (watchedName) {
      const slug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setSlugPreview(slug);
    }
  }, [watchedName]);

  // Actualizar features cuando cambia el plan seleccionado
  useEffect(() => {
    if (selectedPlanId && availablePlans.length > 0) {
      const selectedPlan = availablePlans.find((p) => p._id === selectedPlanId);

      if (selectedPlan) {
        setValue("features", selectedPlan.features, { shouldValidate: true });
        // Forzar revalidación del paso 3 cuando se selecciona un plan
        if (currentStep === 3) {
          trigger("subscription.planId");
        }
      }
    }
  }, [selectedPlanId, availablePlans, setValue, currentStep, trigger]);

  /**
   * Validar campos específicos de un paso
   */
  const validateStep = useCallback(
    async (
      step: number
    ): Promise<{ isValid: boolean; missingFields: string[] }> => {
      let fieldsToValidate: string[] = [];
      let missingFields: string[] = [];

      switch (step) {
        case 1: // Información básica
          fieldsToValidate = [
            "name",
            "email",
            "address.street",
            "address.city",
            "address.state",
            "address.country",
            "address.postalCode",
          ];
          break;
        case 2: // Configuración de negocio
          fieldsToValidate = [
            "settings.businessType",
            "settings.industry",
            "settings.taxId",
            "settings.currency",
          ];
          break;
        case 3: // Plan y características
          fieldsToValidate = ["subscription.planId"];
          console.log(
            "🔍 Validando Step 3 - Plan actual:",
            getValues("subscription")
          );
          break;
        case 4: // Personalización
          fieldsToValidate = [
            "branding.primaryColor",
            "branding.secondaryColor",
          ];
          break;
      }

      // Validar cada campo específicamente
      const results = await Promise.all(
        fieldsToValidate.map((field) => trigger(field as any))
      );

      // Identificar campos que faltan o son inválidos
      fieldsToValidate.forEach((field, index) => {
        if (!results[index]) {
          const fieldLabels: { [key: string]: string } = {
            name: "Nombre de la Empresa",
            email: "Email de Contacto",
            "address.street": "Dirección",
            "address.city": "Ciudad",
            "address.state": "Estado/Región",
            "address.country": "País",
            "address.postalCode": "Código Postal",
            "settings.businessType": "Tipo de Negocio",
            "settings.industry": "Industria",
            "settings.taxId": "RUT/Tax ID",
            "settings.currency": "Moneda",
            "subscription.plan": "Plan de Suscripción",
            "subscription.planId": "Plan de Suscripción",
            "branding.primaryColor": "Color Primario",
            "branding.secondaryColor": "Color Secundario",
          };
          missingFields.push(fieldLabels[field] || field);
        }
      });

      const isValid = results.every((result) => result);
      return { isValid, missingFields };
    },
    [trigger, getValues]
  );

  // Validación optimizada cuando cambie el paso (memorización con cleanup)
  useEffect(() => {
    let isMounted = true;

    const checkValidation = async () => {
      if (!isMounted) return;

      try {
        const validation = await validateStep(currentStep);
        if (isMounted) {
          setIsCurrentStepValid(validation.isValid);
        }
      } catch (error) {
        console.error("Error en validación de paso:", error);
        if (isMounted) {
          setIsCurrentStepValid(false);
        }
      }
    };

    checkValidation();

    return () => {
      isMounted = false;
    };
  }, [currentStep, validateStep]);

  // Validación en tiempo real con debounce optimizada
  const formValues = watch();
  const lastValidationTimeRef = useRef(0);

  useEffect(() => {
    const now = Date.now();
    const shouldValidate = now - lastValidationTimeRef.current > 500; // Debounce de 500ms

    if (!shouldValidate) {
      return;
    }

    let isMounted = true;
    setValidationInProgress(true);

    const timeoutId = setTimeout(async () => {
      if (!isMounted) return;

      try {
        const validation = await validateStep(currentStep);
        if (isMounted) {
          setIsCurrentStepValid(validation.isValid);
          lastValidationTimeRef.current = Date.now();
        }
      } catch (error) {
        console.error("Error en validación en tiempo real:", error);
        if (isMounted) {
          setIsCurrentStepValid(false);
        }
      } finally {
        if (isMounted) {
          setValidationInProgress(false);
        }
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [formValues, currentStep, validateStep]);

  /**
   * Avanzar al siguiente paso
   */
  const nextStep = async (e?: React.MouseEvent) => {
    e?.preventDefault();

    try {
      setValidationInProgress(true);
      const validation = await validateStep(currentStep);

      if (validation.isValid) {
        const newStep = Math.min(currentStep + 1, 4) as FormStep;
        setCurrentStep(newStep);
      } else {
        const missingFieldsList = validation.missingFields.join(", ");
        const message =
          validation.missingFields.length === 1
            ? `Por favor complete el campo requerido: ${missingFieldsList}`
            : `Por favor complete los siguientes campos requeridos: ${missingFieldsList}`;

        toast.warning(message, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error("Error al avanzar paso:", error);
      toast.error("Error al validar el formulario");
    } finally {
      setValidationInProgress(false);
    }
  };

  /**
   * Retroceder al paso anterior
   */
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => Math.max(prev - 1, 1) as FormStep);
    }
  };

  /**
   * Ir a un paso específico (para el stepper)
   */
  const goToStep = async (step: FormStep) => {
    // Validar que no salte pasos sin completar
    if (step > currentStep) {
      // Validar todos los pasos intermedios
      for (let s = currentStep; s < step; s++) {
        const validation = await validateStep(s as FormStep);
        if (!validation.isValid) {
          toast.warning(`Complete el paso ${s} antes de continuar`);
          return;
        }
      }
    }
    setCurrentStep(step);
  };

  /**
   * Enviar formulario
   */
  const onSubmit = async (data: CreateCompanyFormData) => {
    if (currentStep !== 4) {
      console.error("Submit ejecutado en paso incorrecto!");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await EnhancedCompanyAPI.createCompany(data);

      if (result.success && result.company) {
        toast.success("🎉 Empresa creada exitosamente", {
          position: "top-right",
          autoClose: 3000,
        });

        onSuccess(result.company);
        resetForm();
      } else {
        throw new Error(result.message || "Error al crear empresa");
      }
    } catch (error) {
      console.error("Error al crear empresa:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error inesperado";

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });

      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Resetear formulario completamente
   */
  const resetForm = () => {
    reset(defaultCompanyFormValues);
    setCurrentStep(1);
    setIsCurrentStepValid(false);
    setValidationInProgress(false);
    setSelectedPlanId("");
    setSlugPreview("");
  };

  return {
    // Form state
    register,
    errors,
    watch,
    setValue,
    getValues,
    trigger,

    // Step management
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    goToStep,

    // Validation
    isCurrentStepValid,
    validationInProgress,
    validateStep,

    // Submission
    handleSubmit: (e?: React.BaseSyntheticEvent) => {
      // Prevenir submit si no estamos en el paso final
      if (currentStep !== 4) {
        e?.preventDefault();
        return Promise.resolve();
      }
      return rhfHandleSubmit(onSubmit)(e);
    },
    isSubmitting,

    // Plans
    availablePlans,
    plansLoading,
    selectedPlanId,
    setSelectedPlanId,

    // Slug
    slugPreview,
    setSlugPreview,

    // Reset
    resetForm,
  };
}
