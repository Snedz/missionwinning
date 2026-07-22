package com.missionwinning.feature.auth

import org.junit.Assert.assertEquals
import org.junit.Test

class AuthPrefsFeedbackTest {
    @Test
    fun normalizeWeightUnit_defaultsToKg() {
        assertEquals("kg", AuthPrefsFeedback.normalizeWeightUnit("kg"))
        assertEquals("kg", AuthPrefsFeedback.normalizeWeightUnit("KG"))
        assertEquals("kg", AuthPrefsFeedback.normalizeWeightUnit("other"))
        assertEquals("lb", AuthPrefsFeedback.normalizeWeightUnit("lb"))
        assertEquals("lb", AuthPrefsFeedback.normalizeWeightUnit("LB"))
    }

    @Test
    fun weightUnitMessage_matchesUnit() {
        assertEquals("Weight unit: kilograms", AuthPrefsFeedback.weightUnitMessage("kg"))
        assertEquals("Weight unit: pounds", AuthPrefsFeedback.weightUnitMessage("lb"))
    }

    @Test
    fun equipmentLabel_andReseedMessage() {
        assertEquals("Bodyweight", AuthPrefsFeedback.equipmentLabel("bodyweight"))
        assertEquals("Dumbbells", AuthPrefsFeedback.equipmentLabel("dumbbells"))
        assertEquals("Full gym", AuthPrefsFeedback.equipmentLabel("full-gym"))
        assertEquals(
            "Week plan reseeded for Dumbbells",
            AuthPrefsFeedback.reseedSuccessMessage("dumbbells"),
        )
        assertEquals(
            "Week plan reseeded for Bodyweight",
            AuthPrefsFeedback.reseedSuccessMessage("unknown"),
        )
    }
}
