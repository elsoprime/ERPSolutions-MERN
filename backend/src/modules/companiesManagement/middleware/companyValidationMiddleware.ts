/**
 * Enhanced Company Validation Middleware v2.0
 * @description: Middleware para validar datos de entrada usando CompanyUtils y tipos Enhanced
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 2.0.0
 * @updated: 28/10/2025
 */

import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { CompanyValidationUtils } from "../utils/CompanyUtils";
import {
  ICreateCompanyRequest,
  IUpdateCompanyRequest,
  CompanyStatus,
  BusinessType,
  Currency,
} from "../types/EnhandedCompanyTypes";
import { PlanType } from "@/interfaces/IPlan";

// ============ TIPOS PARA VALIDACIÓN ============

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// ============ CLASE DE MIDDLEWARE DE VALIDACIÓN ============

export class CompanyValidationMiddleware {
  /**
   * Validar datos para crear nueva empresa
   */
  static validateCreateCompany = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const companyData: ICreateCompanyRequest = req.body;
      const errors: string[] = [];

      // Validaciones requeridas
      if (!companyData.name || companyData.name.trim().length === 0) {
        errors.push("El nombre de la empresa es requerido");
      } else if (companyData.name.length < 3) {
        errors.push("El nombre debe tener al menos 3 caracteres");
      } else if (companyData.name.length > 100) {
        errors.push("El nombre no puede exceder 100 caracteres");
      }

      if (!companyData.email || companyData.email.trim().length === 0) {
        errors.push("El email de la empresa es requerido");
      } else if (!CompanyValidationUtils.validateEmail(companyData.email)) {
        errors.push("El formato del email no es válido");
      }

      // Validar slug si se proporciona
      if (companyData.slug) {
        if (!CompanyValidationUtils.validateSlug(companyData.slug)) {
          errors.push(
            "El slug solo puede contener letras minúsculas, números y guiones"
          );
        }
      }

      // Validar teléfono si se proporciona
      if (companyData.phone) {
        if (!CompanyValidationUtils.validatePhone(companyData.phone)) {
          errors.push("El formato del teléfono no es válido");
        }
      }

      // Validar website si se proporciona
      if (companyData.website) {
        if (!CompanyValidationUtils.validateURL(companyData.website)) {
          errors.push("El formato de la URL del website no es válido");
        }
      }

      // Validar dirección si se proporciona
      if (companyData.address) {
        const requiredAddressFields = ["street", "city", "state", "country"];
        requiredAddressFields.forEach((field) => {
          if (
            !companyData.address![field as keyof typeof companyData.address] ||
            companyData.address![
              field as keyof typeof companyData.address
            ]!.trim().length === 0
          ) {
            errors.push(`El campo ${field} de la dirección es requerido`);
          }
        });
      }

      // Validar plan si se proporciona (ahora es ObjectId)
      if (companyData.plan) {
        if (!mongoose.Types.ObjectId.isValid(companyData.plan)) {
          errors.push("El ID del plan de suscripción es inválido");
        }
      }

      // Validar settings si se proporcionan
      if (companyData.settings) {
        // Validar taxId
        if (companyData.settings.taxId) {
          if (
            companyData.settings.taxId.length < 5 ||
            companyData.settings.taxId.length > 20
          ) {
            errors.push("El RUT/Tax ID debe tener entre 5 y 20 caracteres");
          }
        }

        // Validar businessType
        if (
          companyData.settings.businessType &&
          !Object.values(BusinessType).includes(
            companyData.settings.businessType
          )
        ) {
          errors.push("Tipo de negocio inválido");
        }

        // Validar currency
        if (
          companyData.settings.currency &&
          !Object.values(Currency).includes(companyData.settings.currency)
        ) {
          errors.push("Moneda inválida");
        }

        // Validar fiscalYear si se proporciona
        if (companyData.settings.fiscalYear) {
          const { startMonth, endMonth } = companyData.settings.fiscalYear;
          if (
            startMonth < 1 ||
            startMonth > 12 ||
            endMonth < 1 ||
            endMonth > 12
          ) {
            errors.push("Los meses del año fiscal deben estar entre 1 y 12");
          }
        }
      }

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Error de validación en los datos de la empresa",
          error: "VALIDATION_ERROR",
          details: errors,
        });
        return;
      }

      next();
    } catch (error) {
      console.error("Error en validación de creación de empresa:", error);
      res.status(500).json({
        success: false,
        message: "Error interno en la validación",
        error: "INTERNAL_ERROR",
      });
    }
  };

  /**
   * Validar datos para actualizar empresa
   */
  static validateUpdateCompany = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const updateData: IUpdateCompanyRequest = req.body;
      const errors: string[] = [];

      // Validar nombre si se proporciona
      if (updateData.name !== undefined) {
        if (!updateData.name || updateData.name.trim().length === 0) {
          errors.push("El nombre no puede estar vacío");
        } else if (updateData.name.length < 3) {
          errors.push("El nombre debe tener al menos 3 caracteres");
        } else if (updateData.name.length > 100) {
          errors.push("El nombre no puede exceder 100 caracteres");
        }
      }

      // Validar email si se proporciona
      if (updateData.email !== undefined) {
        if (!updateData.email || updateData.email.trim().length === 0) {
          errors.push("El email no puede estar vacío");
        } else if (!CompanyValidationUtils.validateEmail(updateData.email)) {
          errors.push("El formato del email no es válido");
        }
      }

      // Validar slug si se proporciona
      if (updateData.slug !== undefined) {
        if (
          updateData.slug &&
          !CompanyValidationUtils.validateSlug(updateData.slug)
        ) {
          errors.push(
            "El slug solo puede contener letras minúsculas, números y guiones"
          );
        }
      }

      // Validar teléfono si se proporciona
      if (updateData.phone !== undefined) {
        if (
          updateData.phone &&
          !CompanyValidationUtils.validatePhone(updateData.phone)
        ) {
          errors.push("El formato del teléfono no es válido");
        }
      }

      // Validar website si se proporciona
      if (updateData.website !== undefined) {
        if (
          updateData.website &&
          !CompanyValidationUtils.validateURL(updateData.website)
        ) {
          errors.push("El formato de la URL del website no es válido");
        }
      }

      // Validar plan si se proporciona (ahora es ObjectId)
      if (updateData.plan !== undefined && updateData.plan) {
        if (!mongoose.Types.ObjectId.isValid(updateData.plan)) {
          errors.push("El ID del plan de suscripción es inválido");
        }
      }

      // Validar status si se proporciona
      if (
        updateData.status !== undefined &&
        updateData.status &&
        !Object.values(CompanyStatus).includes(updateData.status)
      ) {
        errors.push("Estado de empresa inválido");
      }

      // Validar settings si se proporcionan
      if (updateData.settings) {
        if (updateData.settings.taxId !== undefined) {
          if (
            updateData.settings.taxId &&
            (updateData.settings.taxId.length < 5 ||
              updateData.settings.taxId.length > 20)
          ) {
            errors.push("El RUT/Tax ID debe tener entre 5 y 20 caracteres");
          }
        }

        if (
          updateData.settings.businessType !== undefined &&
          updateData.settings.businessType &&
          !Object.values(BusinessType).includes(
            updateData.settings.businessType
          )
        ) {
          errors.push("Tipo de negocio inválido");
        }

        if (
          updateData.settings.currency !== undefined &&
          updateData.settings.currency &&
          !Object.values(Currency).includes(updateData.settings.currency)
        ) {
          errors.push("Moneda inválida");
        }
      }

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Error de validación en los datos de actualización",
          error: "VALIDATION_ERROR",
          details: errors,
        });
        return;
      }

      next();
    } catch (error) {
      console.error("Error en validación de actualización de empresa:", error);
      res.status(500).json({
        success: false,
        message: "Error interno en la validación",
        error: "INTERNAL_ERROR",
      });
    }
  };

  /**
   * Validar parámetros de ID
   */
  static validateCompanyId = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "ID de empresa requerido",
          error: "MISSING_ID",
        });
        return;
      }

      // Validar formato de ObjectId de MongoDB
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(id)) {
        res.status(400).json({
          success: false,
          message: "Formato de ID de empresa inválido",
          error: "INVALID_ID_FORMAT",
        });
        return;
      }

      next();
    } catch (error) {
      console.error("Error en validación de ID de empresa:", error);
      res.status(500).json({
        success: false,
        message: "Error interno en la validación",
        error: "INTERNAL_ERROR",
      });
    }
  };

  /**
   * Validar parámetros de slug
   */
  static validateCompanySlug = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const { slug } = req.params;

      if (!slug) {
        res.status(400).json({
          success: false,
          message: "Slug de empresa requerido",
          error: "MISSING_SLUG",
        });
        return;
      }

      if (!CompanyValidationUtils.validateSlug(slug)) {
        res.status(400).json({
          success: false,
          message: "Formato de slug inválido",
          error: "INVALID_SLUG_FORMAT",
        });
        return;
      }

      next();
    } catch (error) {
      console.error("Error en validación de slug de empresa:", error);
      res.status(500).json({
        success: false,
        message: "Error interno en la validación",
        error: "INTERNAL_ERROR",
      });
    }
  };

  /**
   * Validar cambio de plan
   */
  static validatePlanChange = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const { plan } = req.body;

      if (!plan) {
        res.status(400).json({
          success: false,
          message: "Plan de suscripción requerido",
          error: "MISSING_PLAN",
        });
        return;
      }

      if (!Object.values(PlanType).includes(plan)) {
        res.status(400).json({
          success: false,
          message: "Plan de suscripción inválido",
          error: "INVALID_PLAN",
          availablePlans: Object.values(PlanType),
        });
        return;
      }

      next();
    } catch (error) {
      console.error("Error en validación de cambio de plan:", error);
      res.status(500).json({
        success: false,
        message: "Error interno en la validación",
        error: "INTERNAL_ERROR",
      });
    }
  };

  /**
   * Validar cambio de estado
   */
  static validateStatusChange = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const { status } = req.body;

      if (!status) {
        res.status(400).json({
          success: false,
          message: "Estado de empresa requerido",
          error: "MISSING_STATUS",
        });
        return;
      }

      if (!Object.values(CompanyStatus).includes(status)) {
        res.status(400).json({
          success: false,
          message: "Estado de empresa inválido",
          error: "INVALID_STATUS",
          availableStatuses: Object.values(CompanyStatus),
        });
        return;
      }

      next();
    } catch (error) {
      console.error("Error en validación de cambio de estado:", error);
      res.status(500).json({
        success: false,
        message: "Error interno en la validación",
        error: "INTERNAL_ERROR",
      });
    }
  };

  /**
   * Validar filtros de búsqueda
   */
  static validateSearchFilters = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const errors: string[] = [];

      // Validar parámetros de paginación
      if (req.query.page) {
        const page = parseInt(req.query.page as string);
        if (isNaN(page) || page < 1) {
          errors.push("El número de página debe ser un entero mayor a 0");
        }
      }

      if (req.query.limit) {
        const limit = parseInt(req.query.limit as string);
        if (isNaN(limit) || limit < 1 || limit > 100) {
          errors.push("El límite debe ser un entero entre 1 y 100");
        }
      }

      // Validar filtros de estado
      if (req.query.status) {
        const statuses = Array.isArray(req.query.status)
          ? req.query.status
          : [req.query.status];

        const invalidStatuses = statuses.filter(
          (status) =>
            !Object.values(CompanyStatus).includes(status as CompanyStatus)
        );

        if (invalidStatuses.length > 0) {
          errors.push(`Estados inválidos: ${invalidStatuses.join(", ")}`);
        }
      }

      // Validar filtros de plan
      if (req.query.plan) {
        const plans = Array.isArray(req.query.plan)
          ? req.query.plan
          : [req.query.plan];

        const invalidPlans = plans.filter(
          (plan) => !Object.values(PlanType).includes(plan as PlanType)
        );

        if (invalidPlans.length > 0) {
          errors.push(`Planes inválidos: ${invalidPlans.join(", ")}`);
        }
      }

      // Validar filtros de tipo de negocio
      if (req.query.businessType) {
        const businessTypes = Array.isArray(req.query.businessType)
          ? req.query.businessType
          : [req.query.businessType];

        const invalidBusinessTypes = businessTypes.filter(
          (type) => !Object.values(BusinessType).includes(type as BusinessType)
        );

        if (invalidBusinessTypes.length > 0) {
          errors.push(
            `Tipos de negocio inválidos: ${invalidBusinessTypes.join(", ")}`
          );
        }
      }

      // Validar fechas
      if (req.query.createdAfter) {
        const date = new Date(req.query.createdAfter as string);
        if (isNaN(date.getTime())) {
          errors.push("Fecha createdAfter inválida");
        }
      }

      if (req.query.createdBefore) {
        const date = new Date(req.query.createdBefore as string);
        if (isNaN(date.getTime())) {
          errors.push("Fecha createdBefore inválida");
        }
      }

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Error de validación en los filtros de búsqueda",
          error: "VALIDATION_ERROR",
          details: errors,
        });
        return;
      }

      next();
    } catch (error) {
      console.error("Error en validación de filtros de búsqueda:", error);
      res.status(500).json({
        success: false,
        message: "Error interno en la validación",
        error: "INTERNAL_ERROR",
      });
    }
  };
}

export default CompanyValidationMiddleware;
