FROM node:10.15.0-alpine

RUN echo '{ "allow_root": true }' > /root/.bowerrc

###############################################################################
###	Frontend
###############################################################################
RUN mkdir -p /app/frontend
WORKDIR /app/frontend

COPY frontend ./
# RUN npm install
# RUN npm run build

###############################################################################
###	Backend (BFF)
###############################################################################

RUN mkdir -p /app/backend
WORKDIR /app/backend

COPY backend/package.json ./
RUN npm install
COPY backend ./
RUN npm run build

ARG release
RUN mkdir -p public && \
    echo -n $release > public/VERSION

CMD ["node", "dist/index.js"]
