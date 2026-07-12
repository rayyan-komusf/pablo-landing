# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# El sitio es estático: Astro consulta Notion y resuelve las PUBLIC_* durante
# el build, por eso llegan como build args y no como env de runtime.
ARG NOTION_API_KEY
ARG NOTION_DATABASE_ID
ARG PUBLIC_CHANCHA_ENDPOINT
ARG PUBLIC_FORM_ENDPOINT
ARG PUBLIC_POSTHOG_KEY
ARG PUBLIC_POSTHOG_HOST
ENV NOTION_API_KEY=$NOTION_API_KEY \
    NOTION_DATABASE_ID=$NOTION_DATABASE_ID \
    PUBLIC_CHANCHA_ENDPOINT=$PUBLIC_CHANCHA_ENDPOINT \
    PUBLIC_FORM_ENDPOINT=$PUBLIC_FORM_ENDPOINT \
    PUBLIC_POSTHOG_KEY=$PUBLIC_POSTHOG_KEY \
    PUBLIC_POSTHOG_HOST=$PUBLIC_POSTHOG_HOST

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Serve stage ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
