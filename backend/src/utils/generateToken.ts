/**
 * Generates a unique token string.
 * @returns {string} A unique token.
 * @author Esteban Leonardo Soto @elsoprimeDev
 */
export const generateToken = (): string => {
  //Math.floor(Math.random() * 1e16).toString(36) + Date.now().toString(36)
  return Math.floor(100000 + Math.random() * 900000).toString() // Genera un token numérico de 6 dígitos
}
