/** Autor: @elsoprimeDev */

export function isValidURL(url: string): boolean {
  const urlPattern = new RegExp(
    '^' + // Inicio de la cadena
      '(https?:\\/\\/)?' + // Protocolo opcional (http o https)
      '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.?)+[a-zA-Z]{2,}|' + // Dominio o subdominio
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // Dirección IP (v4)
      '(\\:\\d+)?' + // Puerto opcional
      '(\\/[-a-zA-Z\\d%_.~+]*)*' + // Ruta opcional
      '(\\?[;&a-zA-Z\\d%_.~+=-]*)?' + // Parámetros de consulta opcionales
      '(\\#[-a-zA-Z\\d_]*)?$', // Fragmento opcional
    'i' // Ignora mayúsculas/minúsculas
  )
  return urlPattern.test(url)
}
