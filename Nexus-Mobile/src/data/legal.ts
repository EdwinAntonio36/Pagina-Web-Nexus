// Completar con datos verificados del negocio antes de publicar como versión final.
export const legalBusiness = {
  name: "NEXUS MOBILE SOLUTIONS SAS",
  address: "Felipe Ángeles 225, Local C, Rinconada Los Pirules, Querétaro, Qro., C.P. 76150, México.",
  privacyEmail: "cesar.balderas@miplancelular.mx",
  supportEmail: "",
  approved: false,
};
export const legalUpdated = "5 de noviembre de 2026";
export const legalIsDraft = !legalBusiness.approved || !legalBusiness.name || !legalBusiness.address || !legalBusiness.privacyEmail;
