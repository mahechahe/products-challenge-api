# Start from a Node.js 20 base image
FROM public.ecr.aws/docker/library/node:21-alpine

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the docker image
COPY package*.json /app

# Install all the dependencies
RUN npm install --force

# Install NestJS CLI globally in the docker image
RUN npm install -g @nestjs/cli

# Copy the rest of the application to the docker image
COPY . .

# Build the application
RUN npm run build

EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]