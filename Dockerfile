FROM node:carbon

# Create app directory
RUN mkdir -p /var/www/ms-service/
WORKDIR /var/www/ms-service/

# Install app dependencies
#COPY package.json /var/www/ms-service/

# Bundle app source
COPY . /var/www/ms-service/

CMD ["npm", "start"]