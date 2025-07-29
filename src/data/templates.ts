// Client-specific branding data
export type ClientData = {
  logo: string;
  ctaColor: string;
  ctaTemplate: string;
  footerTemplate: string;
};

// Template structure
export type Template = {
  id: string;
  name: string;
  html: string;
};

// The main data structure
export type Templates = {
  templates: Template[];
  clients: { [clientName: string]: ClientData };
};

// Actual templates data with new structure
export const templates: Templates = {
  templates: [
    {
      id: 'template1',
      name: 'Template 1',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Email Template</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;">
    <tr>
      <td align="center" style="padding:20px 0;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; font-family:Arial, sans-serif; color:#333333; width:600px; max-width:100%;">
        
          <!-- Logo (dynamically inserted based on client) -->
          <tr>
            <td align="center" style="padding:16px;">
              {{logo}}
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="center" style="padding:8px 24px; font-size:24px; font-weight:bold;">
              {{title}}
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 24px 16px 24px; line-height:1.5; font-size:14px;">
              {{body}}
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding:16px;">
              {{cta_button}}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td>
              {{footer}}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    }
  ],
  clients: {
    "Royal Canin": {
      logo: "https://cdn.brandfetch.io/ide1aIn1hE/theme/dark/logo.svg",
      ctaColor: "#E2001A",
      ctaTemplate: `<a target="_blank" href="{{cta_link}}" style="display:inline-block; background-color:#E2001A; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:5px; font-size:14px;">{{cta_text}}</a>`,
      footerTemplate: `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#e9e9e9; font-family:Arial, sans-serif;">
    <tr>
      <td align="center" style="padding:32px; font-size:12px; color:#555555;">
        <p style="margin:0 0 8px 0; line-height:1.5;">&copy; ROYAL CANIN&reg; 2025.<br>All rights reserved. An Affiliate of Mars, Incorporated.</p>
        <p style="margin:16px 0 8px 0;">
          <a href="https://www.mars.com/legal" target="_blank" style="color:#555555; text-decoration:underline;">Legal</a> |
          <a href="https://www.mars.com/privacy" target="_blank" style="color:#555555; text-decoration:underline;">Privacy</a>
        </p>
        <p style="margin:24px 0 8px 0;">Powered by:</p>
        <img src="https://paygos.ca/wp-content/themes/paygos2021/images/logo.png" alt="Paygos" width="100" style="display:block; margin:0 auto; filter:brightness(0) contrast(0);">
      </td>
    </tr>
  </table>`
    },
    "Hills Canada": {
      logo: "https://cdn.brandfetch.io/idVKGfG_3n/w/200/h/200/theme/dark/logo.png",
      ctaColor: "#0054A4",
      ctaTemplate: `<a target="_blank" href="{{cta_link}}" style="display:inline-block; background-color:#0054A4; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:5px; font-size:14px;">{{cta_text}}</a>`,
      footerTemplate: `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#e9e9e9; font-family:Arial, sans-serif;">
    <tr>
      <td align="center" style="padding:32px; font-size:12px; color:#555555;">
        <p style="line-height: 24px">
          Hill's Pet Nutrition Canada<br />P.O. Box 699 Streetsville<br />Mississauga,
          Ontario L5M 2C2
        </p>
        <p>Tel: 1-800-445-5777</p>
        <p style="margin:16px 0 8px 0;">
          <a href="https://www.hillspet.ca/terms-and-conditions" target="_blank" style="color:#555555; text-decoration:underline;">Legal</a> |
          <a href="https://www.hillspet.ca/en-ca/legal-statement-and-privacy-policy" target="_blank" style="color:#555555; text-decoration:underline;">Privacy</a>
        </p>
        <p style="margin:24px 0 8px 0;">Powered by:</p>
        <img src="https://paygos.ca/wp-content/themes/paygos2021/images/logo.png" alt="Paygos" width="100" style="display:block; margin:0 auto; filter:brightness(0) contrast(0);">
      </td>
    </tr>
  </table>`
    },
    "MARS": {
      logo: "https://cdn.brandfetch.io/idFvQZLcOg/theme/dark/logo.svg",
      ctaColor: "#0000A0",
      ctaTemplate: `<a target="_blank" href="{{cta_link}}" style="display:inline-block; background-color:#0000A0; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:5px; font-size:14px;">{{cta_text}}</a>`,
      footerTemplate: `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#e9e9e9; font-family:Arial, sans-serif;">
    <tr>
      <td align="center" style="padding:32px; font-size:12px; color:#555555;">
        <p style="line-height:24px;">© 2025 Mars, Incorporated and its Affiliates. All Rights Reserved</p>
        <p style="margin:16px 0 8px 0;">
          <a href="https://www.mars.com/legal" target="_blank" style="color:#555555; text-decoration:underline;">Legal</a> |
          <a href="https://www.mars.com/privacy" target="_blank" style="color:#555555; text-decoration:underline;">Privacy</a>
        </p>
        <p style="margin:24px 0 8px 0;">Powered by:</p>
        <img src="https://paygos.ca/wp-content/themes/paygos2021/images/logo.png" alt="Paygos" width="100" style="display:block; margin:0 auto; filter:brightness(0) contrast(0);">
      </td>
    </tr>
  </table>`
    },
    "Nestle": {
      logo: "https://cdn.brandfetch.io/id1xOwiSj_/theme/dark/logo.svg",
      ctaColor: "#007CBA",
      ctaTemplate: `<a target="_blank" href="{{cta_link}}" style="display:inline-block; background-color:#007CBA; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:5px; font-size:14px;">{{cta_text}}</a>`,
      footerTemplate: `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#e9e9e9; font-family:Arial, sans-serif;">
    <tr>
      <td align="center" style="padding:32px; font-size:12px; color:#F6F5F4;">
        <p style="line-height:24px;">© 2025 Nestlé. All rights reserved.</p> 
        <p style="margin:16px 0 8px 0;">
          <a href="https://www.nestle.com/info/legal" target="_blank" style="color:#F6F5F4; text-decoration:underline;">Legal</a> |
          <a href="https://www.nestle.com/info/privacy" target="_blank" style="color:#F6F5F4; text-decoration:underline;">Privacy</a>
        </p>
        <p style="margin:24px 0 8px 0;">Powered by:</p>
        <img src="https://paygos.ca/wp-content/themes/paygos2021/images/logo.png" alt="Paygos" width="100" style="display:block; margin:0 auto; filter:brightness(0) contrast(0);">
      </td>
    </tr>
  </table>`
    }
  }
};