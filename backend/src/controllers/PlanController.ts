/**
 * @fileoverview Plan Controller
 * @description Controlador para gestionar planes de suscripción
 * @author Esteban Soto Ojeda (@elsoprimeDev)
 */

import { Request, Response } from "express";
import Plan from "../models/Plan";
import { PlanStatus } from "../interfaces/IPlan";

/**
 * Obtener todos los planes
 * @route GET /api/plans
 * @access Private (Super Admin)
 */
export const getAllPlans = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const plans = await Plan.find().sort({ displayOrder: 1 });

    res.status(200).json({
      success: true,
      data: plans,
      message: "Planes obtenidos exitosamente",
    });
  } catch (error) {
    console.error("Error al obtener planes:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los planes",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

/**
 * Obtener solo planes activos
 * @route GET /api/plans/active
 * @access Public
 */
export const getActivePlans = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const plans = await Plan.find({ status: PlanStatus.ACTIVE }).sort({
      displayOrder: 1,
    });

    res.status(200).json({
      success: true,
      data: plans,
      message: "Planes activos obtenidos exitosamente",
    });
  } catch (error) {
    console.error("Error al obtener planes activos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los planes activos",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

/**
 * Obtener un plan por ID
 * @route GET /api/plans/:id
 * @access Private (Super Admin)
 */
export const getPlanById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const plan = await Plan.findById(id);

    if (!plan) {
      res.status(404).json({
        success: false,
        message: "Plan no encontrado",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: plan,
      message: "Plan obtenido exitosamente",
    });
  } catch (error) {
    console.error("Error al obtener plan:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el plan",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

/**
 * Crear un nuevo plan
 * @route POST /api/plans
 * @access Private (Super Admin)
 */
export const createPlan = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const planData = req.body;

    // Validar que no exista un plan con el mismo nombre
    const existingPlan = await Plan.findOne({ name: planData.name });
    if (existingPlan) {
      res.status(400).json({
        success: false,
        message: "Ya existe un plan con ese nombre",
      });
      return;
    }

    // Crear el nuevo plan
    const newPlan = new Plan(planData);
    await newPlan.save();

    res.status(201).json({
      success: true,
      data: newPlan,
      message: "Plan creado exitosamente",
    });
  } catch (error) {
    console.error("Error al crear plan:", error);

    // Manejar errores de validación de Mongoose
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({
        success: false,
        message: "Error de validación",
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error al crear el plan",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

/**
 * Actualizar un plan
 * @route PUT /api/plans/:id
 * @access Private (Super Admin)
 */
export const updatePlan = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar que el plan existe
    const plan = await Plan.findById(id);
    if (!plan) {
      res.status(404).json({
        success: false,
        message: "Plan no encontrado",
      });
      return;
    }

    // Validar nombre único si se está actualizando
    if (updateData.name && updateData.name !== plan.name) {
      const existingPlan = await Plan.findOne({ name: updateData.name });
      if (existingPlan) {
        res.status(400).json({
          success: false,
          message: "Ya existe un plan con ese nombre",
        });
        return;
      }
    }

    // Actualizar el plan
    const updatedPlan = await Plan.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: updatedPlan,
      message: "Plan actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar plan:", error);

    // Manejar errores de validación de Mongoose
    if (error instanceof Error && error.name === "ValidationError") {
      res.status(400).json({
        success: false,
        message: "Error de validación",
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error al actualizar el plan",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

/**
 * Eliminar un plan
 * @route DELETE /api/plans/:id
 * @access Private (Super Admin)
 */
export const deletePlan = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Verificar que el plan existe
    const plan = await Plan.findById(id);
    if (!plan) {
      res.status(404).json({
        success: false,
        message: "Plan no encontrado",
      });
      return;
    }

    // TODO: Verificar que no haya empresas asociadas a este plan
    // Esta lógica dependerá de cómo manejes la relación Company-Plan

    // Eliminar el plan
    await Plan.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Plan eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar plan:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar el plan",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};
