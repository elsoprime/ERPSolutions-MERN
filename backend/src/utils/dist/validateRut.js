"use strict";
exports.__esModule = true;
exports.validateRut = void 0;
/**
 * Valida un RUT chileno usando el algoritmo de módulo 11.
 * @param rut El RUT sin puntos ni guiones, como una cadena de texto.
 * @returns Verdadero si el RUT es válido, falso en caso contrario.
 */
function validateRut(rut) {
    // Eliminar espacios, puntos y guión del RUT
    rut = rut.replace(/\s/g, '').replace(/\./g, '').replace(/-/g, '');
    // Asegurarse de que el RUT tiene al menos 2 caracteres (número base + dígito verificador)
    if (rut.length < 2)
        return false;
    // Separar el número base y el dígito verificador
    var rutBody = rut.slice(0, -1);
    var checkDigit = rut.slice(-1).toUpperCase();
    // Variables para el cálculo
    var sum = 0;
    var multiplier = 2;
    // Recorrer el cuerpo del RUT de derecha a izquierda
    for (var i = rutBody.length - 1; i >= 0; i--) {
        sum += parseInt(rutBody[i], 10) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    // Calcular el dígito verificador esperado
    var mod11 = 11 - (sum % 11);
    var expectedCheckDigit;
    if (mod11 === 11) {
        expectedCheckDigit = '0';
    }
    else if (mod11 === 10) {
        expectedCheckDigit = 'K';
    }
    else {
        expectedCheckDigit = mod11.toString();
    }
    // Comparar el dígito verificador calculado con el proporcionado
    return checkDigit === expectedCheckDigit;
}
exports.validateRut = validateRut;
