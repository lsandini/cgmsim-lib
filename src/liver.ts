  import sinusRun from './sinus';
  import logger from './utils';

  /**
   * Calculates insulin suppression factor for hepatic glucose production
   * Based on subcutaneous insulin delivery limitations vs portal insulin
   * @param insulinActivity - Current insulin activity in U/min
   * @param weight - Patient weight in kg
   * @returns Suppression factor (1 = no suppression, 0.35 = maximum suppression)
   */
  function calculateInsulinSuppressionFactor(insulinActivity: number, weight: number): number {
      // For reference calculation, use physiological baseline insulin production
      // Normal pancreas produces ~0.5-1.0 U/hour baseline for glucose homeostasis
      // Using conservative estimate: 0.7 U/hour for 70kg person = 0.01 U/kg/hour
      const physiologicalBasalRate = (0.01 * weight) / 60; // U/min

      // Ratio of current activity to physiological baseline (dimensionless)
      const activityRatio = insulinActivity / physiologicalBasalRate;

      // Subcutaneous insulin suppression parameters based on research:
      // - Portal insulin can achieve >90% suppression  
      // - SC insulin limited to ~65% maximum due to portal-peripheral gradient loss
      // - EC50 ~2x physiological levels due to inefficient hepatic access
      const maxSuppression = 0.65; // Maximum 65% suppression achievable with SC
      const halfMaxRatio = 2.0; // Activity ratio for 50% of max suppression
      const hillCoeff = 1.5; // Hill coefficient for dose-response curve

      // Hill equation for insulin dose-response
      const suppression = Math.pow(activityRatio, hillCoeff) /
                         (Math.pow(halfMaxRatio, hillCoeff) + Math.pow(activityRatio, hillCoeff));

      const effectiveSuppression = suppression * maxSuppression;

      // Return production factor (1 = no suppression, 0.35 = maximum 65% suppression)
      return Math.max(1 - effectiveSuppression, 0.35);
  }

  /**
   * Calculates liver glucose production based on various factors
   * @param isf - Insulin Sensitivity Factor constant
   * @param cr - Carb Ratio (g/U)
   * @param activities - Object containing physical activity, alcohol, and insulin factors
   * @param weight - Patient weight in kg
   * @param timeZone - Timezone string for circadian rhythm calculation
   * @returns Liver glucose production in (mmol/l)/min
   */
  export default function calculateLiverGlucoseProduction(
      isf: number,
      cr: number,
      activities: { physical: number; alcohol: number; insulin?: number },
      weight: number,
      timeZone: string,
  ): number {
      const isfMmol = isf / 18; // Convert ISF to (mmol/L)/U
      logger.debug('[liver] Insulin Sensitivity Factor:', isf, 'Carb Ratio:', cr);

      const physicalActivityFactor = activities?.physical;
      const alcoholFactor = activities?.alcohol;
      const insulinActivity = activities?.insulin || 0;

      // Calculate insulin suppression factor
      const insulinSuppressionFactor = calculateInsulinSuppressionFactor(insulinActivity, weight);

      logger.debug('[liver] Insulin activity: %o U/min, Suppression factor: %o',
                   insulinActivity, insulinSuppressionFactor);

      // Circadian rhythm factors:
      // Sine wave varies between 0.5 and 1.5, centered at 1.0
      // - At midnight: sine = 1.0, cosine = 1.5
      // - At 6 AM: sine = 1.5, cosine = 1.0
      // - At noon: sine = 1.0, cosine = 0.5
      // - At 6 PM: sine = 0.5, cosine = 1.0
      const { sinus, cosinus } = sinusRun(timeZone);
      logger.debug('[liver] Sine factor: %o', sinus);
      logger.debug('[liver] Cosine factor: %o', cosinus);

      // Calculate Carb Factor (CF) = ISF/CR
      // Example: If ISF = 2 mmol/l/U and CR = 10g/U
      // Then CF = 0.2 mmol/l/g
      const carbFactor = isfMmol / cr;

      // Base glucose production rate per minute based on weight
      const baseGlucosePerMinute = 0.002 * weight;

      // Calculate liver glucose production adjusted for all factors including insulin suppression
      const baseGlucoseProduction = alcoholFactor *
                                    physicalActivityFactor *
                                    insulinSuppressionFactor * // NEW: Insulin suppression
                                    carbFactor *
                                    baseGlucosePerMinute;

      // Apply circadian rhythm using sine wave
      const circadianAdjustedProduction = baseGlucoseProduction * sinus;

      logger.debug('[liver] Base glucose production: %o', baseGlucoseProduction);
      logger.debug('[liver] Circadian adjusted production: %o', circadianAdjustedProduction);
      logger.debug('[liver] Suppression breakdown - Physical: %o, Alcohol: %o, Insulin: %o',
                   physicalActivityFactor, alcoholFactor, insulinSuppressionFactor);

      return circadianAdjustedProduction;
  }