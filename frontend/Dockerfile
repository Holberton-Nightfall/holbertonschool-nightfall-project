FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 5173
# --host 0.0.0.0 : sans ça, Vite n'écoute que dans le conteneur et reste inaccessible
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
