# Proxy inverso de PostHog. Desplegar como servicio aparte en EasyPanel,
# expuesto en un subdominio (ej. ph.usapablo.app).
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
