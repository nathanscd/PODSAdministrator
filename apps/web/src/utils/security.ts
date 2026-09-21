const ALLOWED_DOMAINS = [
  'seu-app-producao.com',
  'localhost:5173' 
];

export const safeRedirect = (url: string) => {
  try {
    const targetUrl = new URL(url);
    
    if (ALLOWED_DOMAINS.includes(targetUrl.hostname)) {
      window.location.href = targetUrl.toString();
    } else {
      console.error("Tentativa de redirecionamento para domínio não autorizado:", targetUrl.hostname);
      window.location.href = '/'; 
    }
  } catch (e) {
    if (url.startsWith('/')) {
        window.location.href = url;
    } else {
        console.error("URL inválida para redirecionamento");
    }
  }
};