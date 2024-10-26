/**
 * Valida un RUT chileno usando el algoritmo de módulo 11.
 * @param rut El RUT sin puntos ni guiones, como una cadena de texto.
 * @returns Verdadero si el RUT es válido, falso en caso contrario.
 */
export function validateRut(rut: string): boolean {
    // Eliminar espacios, puntos y guión del RUT
    rut = rut.replace(/\s/g, '').replace(/\./g, '').replace(/-/g, '');

    // Asegurarse de que el RUT tiene al menos 2 caracteres (número base + dígito verificador)
    if (rut.length < 2) return false;

    // Separar el número base y el dígito verificador
    const rutBody = rut.slice(0, -1);
    const checkDigit = rut.slice(-1).toUpperCase();

    // Variables para el cálculo
    let sum = 0;
    let multiplier = 2;

    // Recorrer el cuerpo del RUT de derecha a izquierda
    for (let i = rutBody.length - 1; i >= 0; i--) {
        sum += parseInt(rutBody[i], 10) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    // Calcular el dígito verificador esperado
    const mod11 = 11 - (sum % 11);
    let expectedCheckDigit;

    if (mod11 === 11) {
        expectedCheckDigit = '0';
    } else if (mod11 === 10) {
        expectedCheckDigit = 'K';
    } else {
        expectedCheckDigit = mod11.toString();
    }

    // Comparar el dígito verificador calculado con el proporcionado
    return checkDigit === expectedCheckDigit;
}
