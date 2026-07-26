import type { Locale } from "./types";

interface FindingTemplate {
  title: string;
  description: string;
  details?: string;
}

type FindingMessages = Record<string, (vars?: Record<string, string | number>) => FindingTemplate>;

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, String(value));
  }
  return result;
}

function buildMessages(templates: Record<string, { title: string; description: string; details?: string }>): FindingMessages {
  const messages: FindingMessages = {};
  for (const [key, tpl] of Object.entries(templates)) {
    messages[key] = (vars) => ({
      title: interpolate(tpl.title, vars),
      description: interpolate(tpl.description, vars),
      details: tpl.details ? interpolate(tpl.details, vars) : undefined,
    });
  }
  return messages;
}

const ES_FINDINGS = buildMessages({
  "sd.no_schema": { title: "No se encontró schema markup en el sitio", description: "El sitio no tiene datos estructurados que permitan a buscadores e IA interpretar la identidad de forma precisa.", details: "Se recomienda agregar al menos un bloque JSON-LD con el tipo más adecuado según el contenido del sitio (Person para portfolios personales, Organization para empresas)." },
  "sd.type_detected": { title: "Schema de tipo {type} detectado ({source})", description: "Se encontró un schema markup de tipo {type} que es relevante para la identidad digital." },
  "sd.type_unrecognized": { title: "Schema de tipo {type} detectado pero no es un tipo de identidad reconocido", description: "El tipo {type} existe pero no es uno de los tipos principales para describir una persona o proyecto." },
  "sd.fields_complete": { title: "Campos completos en {type}", description: "Los siguientes campos están correctamente definidos: {fields}." },
  "sd.fields_missing": { title: "Campos faltantes en {type}", description: "Los siguientes campos recomendados no están presentes: {fields}.", details: "Agregar estos campos mejora la capacidad de buscadores e IA para entender la entidad representada." },
  "sd.fields_empty": { title: "Campos vacíos en {type}", description: "Los siguientes campos existen pero tienen valores vacíos: {fields}." },
  "ta.http_success": { title: "Respuesta HTTP exitosa", description: "El servidor respondió con código {code}." },
  "ta.http_fail": { title: "El sitio no responde con un código HTTP exitoso", description: "El servidor respondió con código {code}, lo cual impide que crawlers indexen el contenido correctamente." },
  "ta.response_ok": { title: "Tiempo de respuesta aceptable", description: "El sitio respondió en {ms}ms." },
  "ta.response_slow": { title: "Tiempo de respuesta elevado", description: "El sitio tardó {ms}ms en responder, lo cual supera el umbral recomendado de {max}ms. Esto puede afectar la experiencia de crawlers con timeouts ajustados." },
  "ta.meta_present": { title: "Metadato presente: {name}", description: "El metadato {name} está correctamente definido." },
  "ta.meta_missing": { title: "Metadato faltante: {name}", description: "No se encontró {name} o su valor está vacío. Este metadato es importante para que buscadores e IA muestren información correcta sobre el sitio." },
  "ta.robots_none": { title: "Sin restricciones en robots.txt", description: "No se encontró un archivo robots.txt, lo cual significa que no hay restricciones declaradas para crawlers." },
  "ta.robots_blocks": { title: "robots.txt bloquea todo el sitio para crawlers genéricos", description: "La directiva Disallow: / para User-agent: * impide que buscadores e IA accedan al contenido del sitio. Esto bloquea completamente la visibilidad." },
  "ta.robots_ok": { title: "robots.txt no bloquea contenido relevante", description: "El archivo robots.txt existe y no impide el acceso general de crawlers al contenido principal." },
  "ta.spa_detected": { title: "El sitio parece depender exclusivamente de JavaScript del lado del cliente", description: "El contenido visible del body tiene solo {chars} caracteres de texto. Esto sugiere que el sitio es una SPA sin server side rendering, lo cual dificulta que crawlers e IA accedan al contenido real.", details: "Se recomienda implementar Server Side Rendering (SSR) o Static Site Generation (SSG) para que el contenido sea accesible sin ejecutar JavaScript." },
  "ta.content_ok": { title: "Contenido visible sin necesidad de JavaScript", description: "El body contiene {chars} caracteres de texto accesible para crawlers sin ejecutar JavaScript." },
  "ic.name_consistent": { title: "Nombre consistente entre fuentes", description: "El nombre es coherente entre las {count} fuentes evaluadas ({sources})." },
  "ic.name_inconsistent": { title: "Inconsistencia entre {sourceA} y {sourceB}", description: "{sourceA} dice \"{valueA}\" pero {sourceB} dice \"{valueB}\". Los buscadores e IA pueden interpretar esto como dos entidades distintas." },
  "ic.no_links": { title: "Sin enlaces a perfiles externos", description: "No se encontraron enlaces a plataformas profesionales o sociales reconocidas. Agregar enlaces a GitHub, LinkedIn u otras plataformas fortalece la identidad cruzada y mejora el reconocimiento como entidad." },
  "ic.profile_ok": { title: "Perfil en {domain} accesible", description: "El enlace a {domain} responde correctamente ({code})." },
  "ic.profile_fail": { title: "Perfil en {domain} no accesible", description: "El enlace a {domain} no responde o devuelve un error (código {code}). Esto puede indicar un enlace roto o un perfil inexistente." },
  "as.no_links": { title: "Sin enlaces a plataformas de autoridad", description: "No se encontraron enlaces a plataformas profesionales de publicación o contribución técnica. Incluir enlaces a GitHub, Medium, Dev.to u otras plataformas donde tengas actividad refuerza tu autoridad como profesional." },
  "as.platforms_found": { title: "{count} plataforma{plural} de autoridad enlazada{plural}", description: "Se encontraron enlaces a: {domains}. Esto refuerza la presencia profesional y la credibilidad ante buscadores e IA." },
  "as.author_present": { title: "Metadata de autoría presente", description: "Se encontró autoría definida en: {sources}. Esto ayuda a atribuir el contenido a una entidad específica." },
  "as.author_missing": { title: "Sin metadata de autoría", description: "No se encontró meta author, link rel=author ni campo author en el schema markup. Definir la autoría permite a buscadores e IA atribuir el contenido a una persona específica." },
  "as.dates_present": { title: "Fechas de publicación presentes", description: "Se encontraron fechas en: {sources}. Esto indica que el contenido tiene una línea temporal definida." },
  "as.dates_missing": { title: "Sin fechas de publicación o actualización", description: "No se encontraron fechas de publicación ni de modificación en metadata o schema. Las fechas indican a buscadores que el contenido está actualizado y vigente." },
  "as.achievements_found": { title: "Menciones de logros detectadas", description: "Se encontraron referencias a: {keywords}. Estas menciones refuerzan la credibilidad y autoridad profesional ante sistemas automatizados." },
  "as.achievements_missing": { title: "Sin menciones de logros o contribuciones", description: "No se detectaron menciones de certificaciones, conferencias, contribuciones open source u otros logros profesionales en el contenido visible. Incluir estos logros refuerza la percepción de autoridad." },
  "general.axis_error": { title: "Error durante el análisis de este eje", description: "{message}" },
  "general.axis_partial": { title: "Eje no evaluado en esta versión", description: "{message}" },
});

const EN_FINDINGS = buildMessages({
  "sd.no_schema": { title: "No schema markup found on the site", description: "The site has no structured data that allows search engines and AI to interpret its identity accurately.", details: "It is recommended to add at least one JSON-LD block with the most appropriate type based on the site content (Person for personal portfolios, Organization for companies)." },
  "sd.type_detected": { title: "Schema type {type} detected ({source})", description: "A schema markup of type {type} was found, which is relevant for digital identity." },
  "sd.type_unrecognized": { title: "Schema type {type} detected but not a recognized identity type", description: "The type {type} exists but is not one of the main types for describing a person or project." },
  "sd.fields_complete": { title: "Complete fields in {type}", description: "The following fields are correctly defined: {fields}." },
  "sd.fields_missing": { title: "Missing fields in {type}", description: "The following recommended fields are not present: {fields}.", details: "Adding these fields improves the ability of search engines and AI to understand the represented entity." },
  "sd.fields_empty": { title: "Empty fields in {type}", description: "The following fields exist but have empty values: {fields}." },
  "ta.http_success": { title: "Successful HTTP response", description: "The server responded with code {code}." },
  "ta.http_fail": { title: "The site does not respond with a successful HTTP code", description: "The server responded with code {code}, which prevents crawlers from indexing the content correctly." },
  "ta.response_ok": { title: "Acceptable response time", description: "The site responded in {ms}ms." },
  "ta.response_slow": { title: "High response time", description: "The site took {ms}ms to respond, which exceeds the recommended threshold of {max}ms. This may affect the experience of crawlers with tight timeouts." },
  "ta.meta_present": { title: "Metadata present: {name}", description: "The {name} metadata is correctly defined." },
  "ta.meta_missing": { title: "Missing metadata: {name}", description: "{name} was not found or its value is empty. This metadata is important for search engines and AI to display correct information about the site." },
  "ta.robots_none": { title: "No restrictions in robots.txt", description: "No robots.txt file was found, which means there are no declared restrictions for crawlers." },
  "ta.robots_blocks": { title: "robots.txt blocks the entire site for generic crawlers", description: "The Disallow: / directive for User-agent: * prevents search engines and AI from accessing the site content. This completely blocks visibility." },
  "ta.robots_ok": { title: "robots.txt does not block relevant content", description: "The robots.txt file exists and does not prevent general crawler access to the main content." },
  "ta.spa_detected": { title: "The site appears to rely exclusively on client-side JavaScript", description: "The visible body content has only {chars} characters of text. This suggests the site is a SPA without server-side rendering, which makes it difficult for crawlers and AI to access the actual content.", details: "It is recommended to implement Server Side Rendering (SSR) or Static Site Generation (SSG) so content is accessible without executing JavaScript." },
  "ta.content_ok": { title: "Visible content without JavaScript dependency", description: "The body contains {chars} characters of text accessible to crawlers without executing JavaScript." },
  "ic.name_consistent": { title: "Consistent name across sources", description: "The name is coherent across the {count} evaluated sources ({sources})." },
  "ic.name_inconsistent": { title: "Inconsistency between {sourceA} and {sourceB}", description: "{sourceA} says \"{valueA}\" but {sourceB} says \"{valueB}\". Search engines and AI may interpret this as two distinct entities." },
  "ic.no_links": { title: "No external profile links found", description: "No links to recognized professional or social platforms were found. Adding links to GitHub, LinkedIn, or other platforms strengthens cross-identity and improves entity recognition." },
  "ic.profile_ok": { title: "Profile on {domain} accessible", description: "The link to {domain} responds correctly ({code})." },
  "ic.profile_fail": { title: "Profile on {domain} not accessible", description: "The link to {domain} does not respond or returns an error (code {code}). This may indicate a broken link or a non-existent profile." },
  "as.no_links": { title: "No links to authority platforms", description: "No links to professional publication or technical contribution platforms were found. Including links to GitHub, Medium, Dev.to, or other platforms where you are active reinforces your authority as a professional." },
  "as.platforms_found": { title: "{count} authority platform{plural} linked", description: "Links found to: {domains}. This reinforces professional presence and credibility for search engines and AI." },
  "as.author_present": { title: "Authorship metadata present", description: "Authorship defined in: {sources}. This helps attribute the content to a specific entity." },
  "as.author_missing": { title: "No authorship metadata", description: "No meta author, link rel=author, or author field in schema markup was found. Defining authorship allows search engines and AI to attribute content to a specific person." },
  "as.dates_present": { title: "Publication dates present", description: "Dates found in: {sources}. This indicates the content has a defined timeline." },
  "as.dates_missing": { title: "No publication or update dates", description: "No publication or modification dates were found in metadata or schema. Dates indicate to search engines that the content is current and relevant." },
  "as.achievements_found": { title: "Achievement mentions detected", description: "References found to: {keywords}. These mentions reinforce professional credibility and authority for automated systems." },
  "as.achievements_missing": { title: "No mentions of achievements or contributions", description: "No mentions of certifications, conferences, open source contributions, or other professional achievements were detected in the visible content. Including these reinforces the perception of authority." },
  "general.axis_error": { title: "Error during analysis of this axis", description: "{message}" },
  "general.axis_partial": { title: "Axis not evaluated in this version", description: "{message}" },
});

const FINDINGS_BY_LOCALE: Record<Locale, FindingMessages> = { es: ES_FINDINGS, en: EN_FINDINGS };

export function getFinding(locale: Locale, key: string, vars?: Record<string, string | number>): FindingTemplate {
  const messages = FINDINGS_BY_LOCALE[locale];
  const messageFn = messages[key];
  if (!messageFn) {
    return { title: key, description: "" };
  }
  return messageFn(vars);
}
