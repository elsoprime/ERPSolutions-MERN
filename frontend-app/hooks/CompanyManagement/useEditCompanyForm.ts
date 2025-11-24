/**
 * Custom Hook: useEditCompanyForm
 * @description: Hook personalizado que encapsula toda la lógica del formulario de edición de empresas
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 1.0.0
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import {
  UpdateCompanyFormData,
  updateCompanySchema,
  convertCompanyToUpdateFormData,
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
export interface UseEditCompanyFormProps {
  company: IEnhancedCompany;
  onSuccess: (company: IEnhancedCompany) => void;
  onError?: (error: Error) => void;
}

/**
 * Retorno del hook
 */
export interface UseEditCompanyFormReturn {
  // React Hook Form
  register: ReturnType<typeof useForm<UpdateCompanyFormData>>["register"];
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  watch: ReturnType<typeof useForm<UpdateCompanyFormData>>["watch"];
  setValue: ReturnType<typeof useForm<UpdateCompanyFormData>>["setValue"];
  getValues: ReturnType<typeof useForm<UpdateCompanyFormData>>["getValues"];
  trigger: ReturnType<typeof useForm<UpdateCompanyFormData>>["trigger"];
  errors: ReturnType<
    typeof useForm<UpdateCompanyFormData>
  >["formState"]["errors"];

  // Steps
  currentStep: FormStep;
  setCurrentStep: (step: FormStep) => void;
  nextStep: (e?: React.MouseEvent) => Promise<void>;
  prevStep: () => void;
  goToStep: (step: FormStep) => Promise<void>;

  // Validation
  isCurrentStepValid: boolean;
  validationInProgress: boolean;
  validateStep: (step: FormStep) => Promise<StepValidationResult>;

  // Plans
  availablePlans: IPlan[];
  plansLoading: boolean;
  selectedPlanId: string;
  setSelectedPlanId: (id: string) => void;
  planChanged: boolean;

  // Submission
  isSubmitting: boolean;

  // Utilities
  slugPreview: string;
  isDirty: boolean;
  dirtyFields: Partial<Record<keyof UpdateCompanyFormData, boolean>>;
  resetForm: () => void;
}

/**
 * Custom Hook para manejar el formulario de edición de empresas
 */
export function useEditCompanyForm({
  company,
  onSuccess,
  onError,
}: UseEditCompanyFormProps): UseEditCompanyFormReturn {
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Ref para detectar cambios manuales de plan
  const lastSelectedPlanIdRef = useRef<string>("");

  // Convertir empresa a formato de formulario (memoizado)
  const formData = useMemo(() => {
    return convertCompanyToUpdateFormData(company as never);
  }, [company._id]);

  // React Hook Form
  const {
    register,
    handleSubmit: rhfHandleSubmit,
    watch,
    formState: { errors, dirtyFields, isDirty },
    setValue,
    getValues,
    reset,
    trigger,
  } = useForm<UpdateCompanyFormData>({
    resolver: zodResolver(updateCompanySchema),
    defaultValues: formData,
    mode: "onChange",
  });

  // Observar cambios en el nombre para generar slug
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

  // Reset del formulario cuando cambia la empresa
  useEffect(() => {
    if (company) {
      const newFormData = convertCompanyToUpdateFormData(company as never);

      // Reset sin el plan (se establecerá después)
      const { subscription, ...restFormData } = newFormData;
      reset({
        ...restFormData,
        subscription: {
          ...subscription,
          planId: "", // Se establecerá después
        },
      });

      setIsInitialized(false);
    }
  }, [company._id, reset]);

  // Cargar planes y establecer el plan actual
  const loadPlansAndSetCurrent = useCallback(async () => {
    if (isInitialized) return;

    try {
      setPlansLoading(true);
      const response = await PlanAPI.getActivePlans();

      if (response.success && response.data) {
        setAvailablePlans(response.data);

        // Extraer planId correctamente (puede ser string u objeto populated)
        let currentPlanId: string;
        if (company.plan) {
          if (typeof company.plan === "object" && company.plan !== null) {
            // Plan viene populated del backend
            currentPlanId = company.plan._id;
          } else {
            // Plan es un string (ObjectId)
            currentPlanId = company.plan;
          }

          const currentPlan = response.data.find(
            (p: IPlan) => p._id === currentPlanId
          );

          if (currentPlan) {
            // Establecer selectedPlanId INMEDIATAMENTE
            setSelectedPlanId(currentPlanId);
            lastSelectedPlanIdRef.current = currentPlanId;

            setValue("subscription.planId", currentPlan._id, {
              shouldValidate: true,
              shouldDirty: false, // NO marcar como modificado
            });

            // Actualizar features
            setValue(
              "features",
              {
                inventoryManagement: currentPlan.features.inventoryManagement,
                accounting: currentPlan.features.accounting,
                hrm: currentPlan.features.hrm,
                crm: currentPlan.features.crm,
                projectManagement: currentPlan.features.projectManagement,
                reports: currentPlan.features.reports,
                multiCurrency: currentPlan.features.multiCurrency,
                apiAccess: currentPlan.features.apiAccess,
                customBranding: currentPlan.features.customBranding,
                prioritySupport: currentPlan.features.prioritySupport,
                advancedAnalytics: currentPlan.features.advancedAnalytics,
                auditLog: currentPlan.features.auditLog,
                customIntegrations: currentPlan.features.customIntegrations,
                dedicatedAccount: currentPlan.features.dedicatedAccount,
              },
              { shouldValidate: true }
            );

            setIsInitialized(true);
          } else {
            // Plan no encontrado, establecer de todos modos
            setSelectedPlanId(currentPlanId);
            setIsInitialized(true);
          }
        } else {
          setIsInitialized(true);
        }
      } else {
        console.error("Error al cargar planes:", response.message);
        setAvailablePlans([]);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error("Error al cargar planes:", error);
      setAvailablePlans([]);
      setIsInitialized(true);
    } finally {
      setPlansLoading(false);
    }
  }, [isInitialized, company.plan, setValue]);

  useEffect(() => {
    loadPlansAndSetCurrent();
  }, [loadPlansAndSetCurrent]);

  // Actualizar características cuando el usuario cambia el plan manualmente
  useEffect(() => {
    if (!isInitialized || !selectedPlanId || availablePlans.length === 0) {
      return;
    }

    // Extraer el planId de la empresa
    let companyPlanId: string;
    if (typeof company.plan === "object" && company.plan !== null) {
      companyPlanId = company.plan._id;
    } else {
      companyPlanId = company.plan;
    }

    // Ignorar el primer cambio (inicialización)
    if (
      lastSelectedPlanIdRef.current === "" &&
      selectedPlanId === companyPlanId
    ) {
      lastSelectedPlanIdRef.current = selectedPlanId;
      return;
    }

    // Solo actualizar si realmente cambió
    if (selectedPlanId === lastSelectedPlanIdRef.current) {
      return;
    }

    const selectedPlan = availablePlans.find((p) => p._id === selectedPlanId);
    if (selectedPlan) {
      setValue("subscription.planId", selectedPlan._id, {
        shouldValidate: true,
        shouldDirty: true, // Marcar como dirty porque el usuario cambió el plan
      });

      // Actualizar features
      setValue(
        "features",
        {
          inventoryManagement: selectedPlan.features.inventoryManagement,
          accounting: selectedPlan.features.accounting,
          hrm: selectedPlan.features.hrm,
          crm: selectedPlan.features.crm,
          projectManagement: selectedPlan.features.projectManagement,
          reports: selectedPlan.features.reports,
          multiCurrency: selectedPlan.features.multiCurrency,
          apiAccess: selectedPlan.features.apiAccess,
          customBranding: selectedPlan.features.customBranding,
          prioritySupport: selectedPlan.features.prioritySupport,
          advancedAnalytics: selectedPlan.features.advancedAnalytics,
          auditLog: selectedPlan.features.auditLog,
          customIntegrations: selectedPlan.features.customIntegrations,
          dedicatedAccount: selectedPlan.features.dedicatedAccount,
        },
        { shouldValidate: true, shouldDirty: true }
      );

      lastSelectedPlanIdRef.current = selectedPlanId;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlanId, availablePlans, isInitialized, company.plan]);

  // Detectar si el plan cambió
  const planChanged = useMemo(() => {
    if (!selectedPlanId || !company.plan) return false;

    const originalPlanId =
      typeof company.plan === "object" ? company.plan._id : company.plan;

    return selectedPlanId !== originalPlanId;
  }, [selectedPlanId, company.plan]);

  // Validar campos por paso
  const validateStep = useCallback(
    async (step: FormStep): Promise<StepValidationResult> => {
      let fieldsToValidate: string[] = [];
      let missingFields: string[] = [];

      switch (step) {
        case 1:
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
        case 2:
          fieldsToValidate = [
            "settings.businessType",
            "settings.industry",
            "settings.taxId",
            "settings.currency",
          ];
          break;
        case 3:
          fieldsToValidate = ["subscription.planId"];
          break;
        case 4:
          fieldsToValidate = [
            "branding.primaryColor",
            "branding.secondaryColor",
          ];
          break;
      }

      // Validar campos
      const results = await Promise.all(
        fieldsToValidate.map((field) => trigger(field as any))
      );

      // Identificar campos faltantes
      fieldsToValidate.forEach((field, index) => {
        if (!results[index]) {
          missingFields.push(field);
        }
      });

      // 🔍 Debug específico para paso 4
      if (step === 4) {
        console.log("🔍 DEBUG Paso 4 - Validación:", {
          step,
          fieldsToValidate,
          results,
          missingFields,
          currentValues: {
            primaryColor: getValues("branding.primaryColor"),
            secondaryColor: getValues("branding.secondaryColor"),
          },
          errors: {
            primaryColor: errors.branding?.primaryColor,
            secondaryColor: errors.branding?.secondaryColor,
          },
        });
      }

      return {
        isValid: results.every((result) => result === true),
        missingFields,
      };
    },
    [trigger]
  );

  // Validación optimizada cuando cambie el paso (con cleanup)
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

  // Navegación: Siguiente paso
  const nextStep = useCallback(
    async (e?: React.MouseEvent) => {
      e?.preventDefault();

      try {
        setValidationInProgress(true);
        const result = await validateStep(currentStep);

        if (result.isValid) {
          if (currentStep < 4) {
            setCurrentStep((prev) => (prev + 1) as FormStep);
          }
        } else {
          const missingFieldsList = result.missingFields.join(", ");
          const message =
            result.missingFields.length === 1
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
    },
    [currentStep, validateStep]
  );

  // Navegación: Paso anterior
  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as FormStep);
    }
  }, [currentStep]);

  // Navegación: Ir a paso específico
  const goToStep = useCallback(
    async (step: FormStep) => {
      // Validar todos los pasos anteriores
      for (let i = 1; i < step; i++) {
        const result = await validateStep(i as FormStep);
        if (!result.isValid) {
          toast.warning(`Debe completar el paso ${i} antes de continuar`);
          return;
        }
      }
      setCurrentStep(step);
    },
    [validateStep]
  );

  // Submit del formulario
  const onSubmit = async (data: UpdateCompanyFormData) => {
    console.log("🚀 onSubmit ejecutándose con data:", {
      companyId: company._id,
      selectedPlanId,
      planChanged,
      data: {
        name: data.name,
        plan: data.subscription?.planId,
        selectedPlan: selectedPlanId,
        branding: data.branding,
      },
    });

    setIsSubmitting(true);

    try {
      // Preparar datos para enviar (incluyendo el plan si cambió)
      const dataToSend = {
        ...data,
        subscription: {
          planId: selectedPlanId,
        },
      };

      console.log("📤 Datos a enviar al backend:", {
        companyId: company._id,
        dataToSend: {
          name: dataToSend.name,
          plan: dataToSend.subscription.planId,
          settings: dataToSend.settings,
          branding: dataToSend.branding,
        },
      });

      // Actualizar empresa
      const result = await EnhancedCompanyAPI.updateCompany(
        company._id,
        dataToSend as never
      );

      console.log("📥 Respuesta del backend:", result);

      if (result.success) {
        // No mostrar toast aquí, se maneja en el componente padre (CompanyTable)
        onSuccess(result.company!);
        resetForm();
      } else {
        console.error("❌ Error en la actualización:", result.message);
        toast.error(result.message || "Error al actualizar empresa", {
          position: "top-right",
          autoClose: 5000,
        });
        onError?.(new Error(result.message));
      }
    } catch (error) {
      console.error("Error updating company:", error);
      toast.error("Error al actualizar empresa", {
        position: "top-right",
        autoClose: 5000,
      });
      onError?.(error as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset del formulario
  const resetForm = useCallback(() => {
    reset(formData);
    setCurrentStep(1);
    setIsInitialized(false);
  }, [reset, formData]);

  return {
    // React Hook Form
    register,
    handleSubmit: (e?: React.BaseSyntheticEvent) => {
      console.log("📋 handleSubmit wrapper ejecutándose:", {
        currentStep,
        isStep4: currentStep === 4,
        event: e?.type,
        allErrors: errors,
        formValues: getValues(),
      });

      // Prevenir submit si no estamos en el paso final
      if (currentStep !== 4) {
        console.log("⚠️ Submit bloqueado - No estamos en paso 4");
        e?.preventDefault();
        return Promise.resolve();
      }

      console.log("✅ Submit permitido - Ejecutando rhfHandleSubmit");

      // Agregar handler de error para capturar validaciones fallidas
      const onError = (formErrors: any) => {
        console.error(
          "❌ Errores de validación detectados por React Hook Form:",
          formErrors
        );
        toast.error("Por favor corrija los errores en el formulario", {
          position: "top-right",
          autoClose: 5000,
        });
      };

      return rhfHandleSubmit(onSubmit, onError)(e);
    },
    watch,
    setValue,
    getValues,
    trigger,
    errors,

    // Steps
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    goToStep,

    // Validation
    isCurrentStepValid,
    validationInProgress,
    validateStep,

    // Plans
    availablePlans,
    plansLoading,
    selectedPlanId,
    setSelectedPlanId,
    planChanged,

    // Submission
    isSubmitting,

    // Utilities
    slugPreview,
    isDirty,
    dirtyFields: dirtyFields as Partial<
      Record<keyof UpdateCompanyFormData, boolean>
    >,
    resetForm,
  };
}
