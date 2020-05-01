FROM node

COPY . /meoclock_service

WORKDIR /meoclock_service

EXPOSE 3002:3002

RUN npm install 

ENTRYPOINT npm run dev

