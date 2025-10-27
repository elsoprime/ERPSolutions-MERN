import bcrypt from 'bcrypt'

/**
 * @description Hashea una contraseña usando bcrypt
 * @author Esteban Leonardo Soto @elsoprimeDev
 * @param password
 * @returns
 */

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

export const checkPassword = async (
  enteredPassword: string,
  storedHash: string
): Promise<boolean> => {
  return await bcrypt.compare(enteredPassword, storedHash)
}
