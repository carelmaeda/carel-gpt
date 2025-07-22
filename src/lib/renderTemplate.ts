
export function renderTemplate(
  template: string,
  values: { title?: string; header?: string; body: string; cta_button: string; footer: string }
) {
  let renderedTemplate = template;

  renderedTemplate = renderedTemplate.replace(/{{title}}/g, values.title || '');
  renderedTemplate = renderedTemplate.replace(/{{header}}/g, values.header || '');
  renderedTemplate = renderedTemplate.replace(/{{body}}/g, values.body || '');
  renderedTemplate = renderedTemplate.replace(/{{cta_button}}/g, values.cta_button || '');
  renderedTemplate = renderedTemplate.replace(/{{footer}}/g, values.footer || '');
  return renderedTemplate;
}