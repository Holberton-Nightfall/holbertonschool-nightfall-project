FROM node:20-alpine
WORKDIR /app

# Dépendances d'abord : cette couche reste en cache tant que package.json ne change pas
COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
