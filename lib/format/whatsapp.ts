/** Arma un link de WhatsApp click-to-chat a partir de un teléfono guardado en
 * configuración, que puede venir con espacios, paréntesis o guiones. Devuelve
 * null si el teléfono no alcanza a ser un número real — nunca se renderiza un
 * link roto. */
export function buildWhatsAppLink(
  telefono: string | null | undefined,
  mensaje?: string
): string | null {
  if (!telefono) return null

  const digitos = telefono.replace(/\D/g, "")
  if (digitos.length < 10) return null

  const numero = digitos.startsWith("57") && digitos.length > 10 ? digitos : `57${digitos}`
  const query = mensaje ? `?text=${encodeURIComponent(mensaje)}` : ""

  return `https://wa.me/${numero}${query}`
}
