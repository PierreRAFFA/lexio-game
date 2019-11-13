FROM node:10-alpine

# Create app directory
WORKDIR /var/app

# Install app dependencies
COPY . /var/app

#RUN npm install --quiet && \
#    npm run build
RUN npm install --quiet

EXPOSE 3000

CMD [ "npm", "run", "start" ]
