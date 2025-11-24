/**
 * Enhanced Company Service v2.0
 * @description: Servicios de negocio para gestión de empresas mejoradas
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 2.0.0
 * @updated: 28/10/2025
 */

import mongoose from "mongoose";
import EnhancedCompany, {
  IEnhancedCompanyDocument,
} from "../models/EnhancedCompany";
import EnhancedUser from "../../userManagement/models/EnhancedUser";
import {
  ICreateCompanyRequest,
  IUpdateCompanyRequest,
  ICompanyFilters,
  IPaginationOptions,
  ICompanyResponse,
  ICompanyActionResult,
  ICompaniesGlobalStats,
  ICompanyValidationResult,
  ICompanyValidationError,
  CompanyStatus,
  BusinessType,
  DEFAULT_COMPANY_SETTINGS,
  DEFAULT_PLAN_LIMITS,
  DEFAULT_PLAN_FEATURES,
} from "../types/EnhandedCompanyTypes";
import { PlanType, PlanStatus } from "@/interfaces/IPlan";
import Plan from "@/models/Plan";

// ============ CLASE DE SERVICIO PRINCIPAL ============

export class EnhancedCompanyService {
  // ============ MÉTODOS DE VALIDACIÓN ============

  /**
   * Validar datos de empresa antes de crear/actualizar
   */
  static async validateCompanyData(
    data: ICreateCompanyRequest | IUpdateCompanyRequest,
    excludeId?: string
  ): Promise<ICompanyValidationResult> {
    const errors: ICompanyValidationError[] = [];

    try {
      // Validar nombre
      if ("name" in data && data.name) {
        if (data.name.length < 3) {
          errors.push({
            field: "name",
            message: "El nombre debe tener al menos 3 caracteres",
            code: "MIN_LENGTH",
            value: data.name,
          });
        }
        if (data.name.length > 100) {
          errors.push({
            field: "name",
            message: "El nombre no puede exceder 100 caracteres",
            code: "MAX_LENGTH",
            value: data.name,
          });
        }
      }

      // Validar email
      if ("email" in data && data.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          errors.push({
            field: "email",
            message: "El formato del email no es válido",
            code: "INVALID_FORMAT",
            value: data.email,
          });
        }

        // Verificar unicidad del email
        const query: any = { email: data.email };
        if (excludeId) {
          query._id = { $ne: excludeId };
        }
        const existingEmail = await EnhancedCompany.findOne(query);
        if (existingEmail) {
          errors.push({
            field: "email",
            message: "Ya existe una empresa con este email",
            code: "DUPLICATE_VALUE",
            value: data.email,
          });
        }
      }

      // Validar slug
      if ("slug" in data && data.slug) {
        const slugRegex = /^[a-z0-9-]+$/;
        if (!slugRegex.test(data.slug)) {
          errors.push({
            field: "slug",
            message:
              "El slug solo puede contener letras minúsculas, números y guiones",
            code: "INVALID_FORMAT",
            value: data.slug,
          });
        }

        if (data.slug.length < 3 || data.slug.length > 50) {
          errors.push({
            field: "slug",
            message: "El slug debe tener entre 3 y 50 caracteres",
            code: "INVALID_LENGTH",
            value: data.slug,
          });
        }

        // Verificar unicidad del slug
        const query: any = { slug: data.slug };
        if (excludeId) {
          query._id = { $ne: excludeId };
        }
        const existingSlug = await EnhancedCompany.findOne(query);
        if (existingSlug) {
          errors.push({
            field: "slug",
            message: "Ya existe una empresa con este slug",
            code: "DUPLICATE_VALUE",
            value: data.slug,
          });
        }
      }

      // Validar taxId
      if (data.settings?.taxId) {
        if (data.settings.taxId.length < 5 || data.settings.taxId.length > 20) {
          errors.push({
            field: "settings.taxId",
            message: "El RUT/Tax ID debe tener entre 5 y 20 caracteres",
            code: "INVALID_LENGTH",
            value: data.settings.taxId,
          });
        }

        // Verificar unicidad del taxId
        const query: any = { "settings.taxId": data.settings.taxId };
        if (excludeId) {
          query._id = { $ne: excludeId };
        }
        const existingTaxId = await EnhancedCompany.findOne(query);
        if (existingTaxId) {
          errors.push({
            field: "settings.taxId",
            message: "Ya existe una empresa con este RUT/Tax ID",
            code: "DUPLICATE_VALUE",
            value: data.settings.taxId,
          });
        }
      }

      // Validar teléfono
      if ("phone" in data && data.phone) {
        const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/;
        if (
          !phoneRegex.test(data.phone) ||
          data.phone.length < 8 ||
          data.phone.length > 20
        ) {
          errors.push({
            field: "phone",
            message: "El formato del teléfono no es válido",
            code: "INVALID_FORMAT",
            value: data.phone,
          });
        }
      }

      // Validar dirección
      if ("address" in data && data.address) {
        const requiredAddressFields = [
          "street",
          "city",
          "state",
          "country",
          "postalCode",
        ];
        requiredAddressFields.forEach((field) => {
          if (
            !data.address![field as keyof typeof data.address] ||
            data.address![field as keyof typeof data.address]!.trim().length ===
              0
          ) {
            errors.push({
              field: `address.${field}`,
              message: `El campo ${field} de la dirección es requerido`,
              code: "REQUIRED_FIELD",
              value: data.address![field as keyof typeof data.address],
            });
          }
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      console.error("Error validando datos de empresa:", error);
      return {
        isValid: false,
        errors: [
          {
            field: "general",
            message: "Error interno durante la validación",
            code: "VALIDATION_ERROR",
          },
        ],
      };
    }
  }

  // ============ MÉTODOS DE CREACIÓN ============

  /**
   * Crear nueva empresa con validaciones completas
   */
  static async createCompany(
    data: ICreateCompanyRequest,
    createdByUserId: string
  ): Promise<ICompanyActionResult> {
    try {
      // Validar datos
      const validation = await this.validateCompanyData(data);
      if (!validation.isValid) {
        return {
          success: false,
          message: "Datos de empresa inválidos",
          error: validation.errors.map((e) => e.message).join(", "),
        };
      }

      // Generar slug si no se proporciona
      const slug = data.slug || this.generateSlugFromName(data.name);

      // Si no se proporcionó plan, obtener el plan FREE por defecto
      let planId: mongoose.Types.ObjectId;
      let planType: PlanType;

      if (!data.plan) {
        // Buscar plan FREE
        const freePlan = await Plan.findOne({
          type: PlanType.FREE,
          status: PlanStatus.ACTIVE,
        });

        if (!freePlan) {
          return {
            success: false,
            message: "Plan FREE no encontrado en el sistema",
            error: "DEFAULT_PLAN_NOT_FOUND",
          };
        }

        planId = freePlan._id as mongoose.Types.ObjectId;
        planType = PlanType.FREE;
      } else {
        planId = data.plan as mongoose.Types.ObjectId;
        // Obtener el plan para saber su tipo
        const plan = await Plan.findById(planId);
        if (!plan) {
          return {
            success: false,
            message: "Plan especificado no encontrado",
            error: "PLAN_NOT_FOUND",
          };
        }
        planType = plan.type;
      }

      // Configuraciones con el tipo de plan
      const settings = this.buildCompanySettings(data.settings, planType);

      // Determinar estado y fechas
      const { status, trialEndsAt, subscriptionEndsAt } =
        this.determineCompanyStatus(planType);

      // Crear empresa
      const companyData = {
        ...data,
        slug,
        status,
        plan: planId,
        settings,
        createdBy: new mongoose.Types.ObjectId(createdByUserId),
        ownerId: new mongoose.Types.ObjectId(createdByUserId),
        trialEndsAt,
        subscriptionEndsAt,
        stats: {
          totalUsers: 0,
          totalProducts: 0,
          lastActivity: new Date(),
          storageUsed: 0,
        },
      };

      const newCompany = await EnhancedCompany.create(companyData);

      return {
        success: true,
        message: "Empresa creada correctamente",
        company: await this.enrichCompanyData(newCompany),
      };
    } catch (error) {
      console.error("Error creando empresa:", error);
      return {
        success: false,
        message: "Error interno al crear la empresa",
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  // ============ MÉTODOS DE LECTURA ============

  /**
   * Obtener empresa por ID con datos enriquecidos
   */
  static async getCompanyById(id: string): Promise<ICompanyActionResult> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          message: "ID de empresa inválido",
          error: "INVALID_ID",
        };
      }

      const company = await EnhancedCompany.findById(id)
        .populate("createdBy", "name email")
        .populate("ownerId", "name email");

      if (!company) {
        return {
          success: false,
          message: "Empresa no encontrada",
          error: "NOT_FOUND",
        };
      }

      // Actualizar estadísticas
      await company.updateStats();

      return {
        success: true,
        message: "Empresa obtenida correctamente",
        company: await this.enrichCompanyData(company),
      };
    } catch (error) {
      console.error("Error obteniendo empresa:", error);
      return {
        success: false,
        message: "Error al obtener la empresa",
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Obtener empresa por slug
   */
  static async getCompanyBySlug(slug: string): Promise<ICompanyActionResult> {
    try {
      if (!slug || slug.length < 3) {
        return {
          success: false,
          message: "Slug inválido",
          error: "INVALID_SLUG",
        };
      }

      const company = await EnhancedCompany.findOne({ slug })
        .populate("createdBy", "name email")
        .populate("ownerId", "name email");

      if (!company) {
        return {
          success: false,
          message: "Empresa no encontrada",
          error: "NOT_FOUND",
        };
      }

      return {
        success: true,
        message: "Empresa obtenida correctamente",
        company: await this.enrichCompanyData(company),
      };
    } catch (error) {
      console.error("Error obteniendo empresa por slug:", error);
      return {
        success: false,
        message: "Error al obtener la empresa",
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Buscar empresas con filtros y paginación
   */
  static async searchCompanies(
    filters: ICompanyFilters = {},
    pagination: IPaginationOptions = { page: 1, limit: 10 }
  ): Promise<{
    success: boolean;
    data?: ICompanyResponse[];
    total?: number;
    error?: string;
  }> {
    try {
      const page = Math.max(1, pagination.page);
      const limit = Math.min(100, Math.max(1, pagination.limit));
      const skip = (page - 1) * limit;

      // Construir query
      const query = this.buildSearchQuery(filters);

      // Construir sort
      const sort = this.buildSortOptions(pagination);

      // Ejecutar consultas
      const [companies, total] = await Promise.all([
        EnhancedCompany.find(query)
          .populate("createdBy", "name email")
          .populate("ownerId", "name email")
          .skip(skip)
          .limit(limit)
          .sort(sort)
          .lean(),
        EnhancedCompany.countDocuments(query),
      ]);

      // Enriquecer datos
      const enrichedCompanies = await Promise.all(
        companies.map((company) =>
          this.enrichCompanyData(new EnhancedCompany(company))
        )
      );

      return {
        success: true,
        data: enrichedCompanies,
        total,
      };
    } catch (error) {
      console.error("Error buscando empresas:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  // ============ MÉTODOS DE ACTUALIZACIÓN ============

  /**
   * Actualizar empresa con validaciones
   */
  static async updateCompany(
    id: string,
    data: IUpdateCompanyRequest
  ): Promise<ICompanyActionResult> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          message: "ID de empresa inválido",
          error: "INVALID_ID",
        };
      }

      // Validar datos
      const validation = await this.validateCompanyData(data, id);
      if (!validation.isValid) {
        return {
          success: false,
          message: "Datos de actualización inválidos",
          error: validation.errors.map((e) => e.message).join(", "),
        };
      }

      // Actualizar empresa
      const updatedCompany = await EnhancedCompany.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
        populate: [
          { path: "createdBy", select: "name email" },
          { path: "ownerId", select: "name email" },
        ],
      });

      if (!updatedCompany) {
        return {
          success: false,
          message: "Empresa no encontrada",
          error: "NOT_FOUND",
        };
      }

      return {
        success: true,
        message: "Empresa actualizada correctamente",
        company: await this.enrichCompanyData(updatedCompany),
      };
    } catch (error) {
      console.error("Error actualizando empresa:", error);
      return {
        success: false,
        message: "Error al actualizar la empresa",
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Cambiar plan de suscripción
   */
  static async changeCompanyPlan(
    id: string,
    newPlanType: PlanType
  ): Promise<ICompanyActionResult> {
    try {
      const company = await EnhancedCompany.findById(id);

      if (!company) {
        return {
          success: false,
          message: "Empresa no encontrada",
          error: "NOT_FOUND",
        };
      }

      // Buscar el documento del plan por tipo
      const planDoc = await Plan.findOne({
        type: newPlanType,
        status: PlanStatus.ACTIVE,
      });

      if (!planDoc) {
        return {
          success: false,
          message: `Plan "${newPlanType}" no encontrado o no está activo`,
          error: "PLAN_NOT_FOUND",
        };
      }

      // Cambiar plan usando el ObjectId del plan
      await company.changeSubscriptionPlan(
        planDoc._id as mongoose.Types.ObjectId
      );

      return {
        success: true,
        message: `Plan cambiado a ${planDoc.name} correctamente`,
        company: await this.enrichCompanyData(company),
      };
    } catch (error) {
      console.error("Error cambiando plan:", error);
      return {
        success: false,
        message: "Error al cambiar el plan",
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  // ============ MÉTODOS DE ESTADÍSTICAS ============

  /**
   * Obtener estadísticas globales
   */
  static async getGlobalStatistics(): Promise<ICompaniesGlobalStats> {
    try {
      const [
        totalCompanies,
        activeCompanies,
        suspendedCompanies,
        trialCompanies,
        planDistribution,
        industryDistribution,
        businessTypeDistribution,
      ] = await Promise.all([
        EnhancedCompany.countDocuments(),
        EnhancedCompany.countDocuments({ status: CompanyStatus.ACTIVE }),
        EnhancedCompany.countDocuments({ status: CompanyStatus.SUSPENDED }),
        EnhancedCompany.countDocuments({ status: CompanyStatus.TRIAL }),
        EnhancedCompany.aggregate([
          { $group: { _id: "$plan", count: { $sum: 1 } } },
        ]),
        EnhancedCompany.aggregate([
          { $group: { _id: "$settings.industry", count: { $sum: 1 } } },
        ]),
        EnhancedCompany.aggregate([
          { $group: { _id: "$settings.businessType", count: { $sum: 1 } } },
        ]),
      ]);

      // Formatear distribuciones
      const planDistributionFormatted = planDistribution.reduce((acc, item) => {
        acc[item._id as PlanType] = item.count;
        return acc;
      }, {} as Record<PlanType, number>);

      const industryDistributionFormatted = industryDistribution.reduce(
        (acc, item) => {
          acc[item._id || "Sin especificar"] = item.count;
          return acc;
        },
        {} as Record<string, number>
      );

      const businessTypeDistributionFormatted = businessTypeDistribution.reduce(
        (acc, item) => {
          acc[item._id as BusinessType] = item.count;
          return acc;
        },
        {} as Record<BusinessType, number>
      );

      // Obtener actividad reciente
      const recentCompanies = await EnhancedCompany.find()
        .select("name createdAt")
        .sort({ createdAt: -1 })
        .limit(10);

      const recentActivity = recentCompanies.map((company) => ({
        companyId: company._id.toString(),
        companyName: company.name,
        action: "Última actualización",
        timestamp: company.createdAt,
      }));

      // Calcular crecimiento mensual
      const currentDate = new Date();
      const lastMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      );
      const newCompaniesThisMonth = await EnhancedCompany.countDocuments({
        createdAt: { $gte: lastMonth },
      });

      return {
        totalCompanies,
        activeCompanies,
        suspendedCompanies,
        trialCompanies,
        planDistribution: planDistributionFormatted,
        industryDistribution: industryDistributionFormatted,
        businessTypeDistribution: businessTypeDistributionFormatted,
        recentActivity,
        monthlyGrowth: {
          newCompanies: newCompaniesThisMonth,
          upgrades: 0, // TODO: Implementar lógica real
          cancellations: 0, // TODO: Implementar lógica real
        },
      };
    } catch (error) {
      console.error("Error obteniendo estadísticas globales:", error);
      throw error;
    }
  }

  // ============ MÉTODOS AUXILIARES PRIVADOS ============

  /**
   * Generar slug desde nombre
   */
  private static generateSlugFromName(name: string): string {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remover acentos
      .replace(/[^a-z0-9\s-]/g, "") // Remover caracteres especiales
      .replace(/\s+/g, "-") // Reemplazar espacios con guiones
      .replace(/-+/g, "-") // Remover guiones duplicados
      .trim()
      .substring(0, 50);
  }

  /**
   * Construir configuraciones de empresa
   */
  private static buildCompanySettings(providedSettings: any, plan: PlanType) {
    return {
      ...DEFAULT_COMPANY_SETTINGS,
      ...providedSettings,
      limits: { ...DEFAULT_PLAN_LIMITS[plan], ...providedSettings?.limits },
      features: {
        ...DEFAULT_PLAN_FEATURES[plan],
        ...providedSettings?.features,
      },
    };
  }

  /**
   * Determinar estado y fechas de empresa
   */
  private static determineCompanyStatus(plan: PlanType) {
    let status: CompanyStatus = CompanyStatus.TRIAL;
    let trialEndsAt: Date | undefined;
    let subscriptionEndsAt: Date | undefined;

    if (plan === PlanType.FREE) {
      status = CompanyStatus.TRIAL;
      trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días
    } else {
      status = CompanyStatus.ACTIVE;
      subscriptionEndsAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 año
    }

    return { status, trialEndsAt, subscriptionEndsAt };
  }

  /**
   * Enriquecer datos de empresa con información computada
   */
  private static async enrichCompanyData(
    company: IEnhancedCompanyDocument
  ): Promise<ICompanyResponse> {
    return {
      ...company.toObject(),
      _id: company._id.toString(), // Convertir ObjectId a string
      usage: company.getUsagePercentage(),
      isActiveComputed: company.isActive(),
      canAddUserComputed: company.canAddUser(),
      isTrialExpiredComputed: company.isTrialExpired(),
      ownerInfo: company.ownerId
        ? {
            _id:
              (company.ownerId as any)._id?.toString() ||
              company.ownerId.toString(),
            name: (company.ownerId as any).name || "Usuario",
            email: (company.ownerId as any).email || "email@empresa.com",
          }
        : undefined,
      creatorInfo: company.createdBy
        ? {
            _id:
              (company.createdBy as any)._id?.toString() ||
              company.createdBy.toString(),
            name: (company.createdBy as any).name || "Usuario",
            email: (company.createdBy as any).email || "email@empresa.com",
          }
        : undefined,
    };
  }

  /**
   * Construir query de búsqueda
   */
  private static buildSearchQuery(filters: ICompanyFilters): any {
    const query: any = {};

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    if (filters.status && filters.status.length > 0) {
      query.status = { $in: filters.status };
    }

    if (filters.plan && filters.plan.length > 0) {
      query.plan = { $in: filters.plan };
    }

    if (filters.businessType && filters.businessType.length > 0) {
      query["settings.businessType"] = { $in: filters.businessType };
    }

    if (filters.industry && filters.industry.length > 0) {
      query["settings.industry"] = {
        $in: filters.industry.map((i) => new RegExp(i, "i")),
      };
    }

    if (filters.createdAfter || filters.createdBefore) {
      query.createdAt = {};
      if (filters.createdAfter) {
        query.createdAt.$gte = filters.createdAfter;
      }
      if (filters.createdBefore) {
        query.createdAt.$lte = filters.createdBefore;
      }
    }

    if (filters.trialExpired) {
      query.status = CompanyStatus.TRIAL;
      query.trialEndsAt = { $lte: new Date() };
    }

    return query;
  }

  /**
   * Construir opciones de ordenamiento
   */
  private static buildSortOptions(pagination: IPaginationOptions): any {
    const sortBy = pagination.sortBy || "createdAt";
    const sortOrder = pagination.sortOrder === "asc" ? 1 : -1;
    return { [sortBy]: sortOrder };
  }
}

export default EnhancedCompanyService;
