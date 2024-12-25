# Products - mahechadev API

## Descripción

Products - mahechadev API es una aplicación diseñada para gestionar productos, clientes, transacciones y envíos, con integración de pagos a través de Wompi. La aplicación está construida utilizando NestJS y DynamoDB, y sigue un enfoque modular basado en la arquitectura hexagonal.

La API está desplegada en **AWS ECS** utilizando **Fargate**, y se encuentra disponible en **[https://api.credisos.net](https://api.credisos.net)**. Se usa **AWS Route 53** para la gestión de dominios y **AWS Certificate Manager** para asegurar el tráfico HTTPS.

[POSTMAN]([https://api.credisos.net/api/docs](https://documenter.getpostman.com/view/19544749/2sAYJ4jMN1))

## Documentación de Postman

Para acceder a la documentación interactiva y las colecciones de Postman de la API, utiliza el siguiente enlace:

[**DevTech API - Documentación en Postman**](https://documenter.getpostman.com/view/19544749/2sAYJ4jMN1)

Este enlace te llevará a la colección completa de la API, donde podrás probar todas las rutas y ver ejemplos de peticiones y respuestas. La colección de Postman está organizada de manera que puedas explorar cada endpoint de la API con ejemplos prácticos y detalles adicionales.

## Estructura del Proyecto

El proyecto sigue una arquitectura hexagonal, que separa las diferentes capas de la aplicación, permitiendo que la lógica de negocio sea independiente de la infraestructura y las interfaces externas. Esto facilita el mantenimiento y escalabilidad del proyecto.

### Directorios Principales

- `src/application`: Contiene los casos de uso y puertos (interfaces), encargados de orquestar la lógica de negocio.
- `src/domain`: Define las entidades del dominio.
- `src/infrastructure`: Aloja los adaptadores, la configuración de infraestructura y las implementaciones concretas de los puertos.
- `src/infrastructure/adapters`: Implementaciones de los puertos, servicios de terceros, y los controladores que manejan las solicitudes HTTP.
- `src/infrastructure/config`: Configuraciones de módulos y bases de datos.

## Modelo de Datos

El modelo de datos se utiliza para interactuar con DynamoDB, que aloja información sobre productos, clientes, pagos, transacciones y envíos.

### Ejemplo de modelo de producto:

```typescript
export interface Product {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  imageAltText: string;
  slug: string;
  images: Image[];
  isFeatured: boolean;
}

export interface Image {
  id: string;
  url: string;
  altText: string;
  productId: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  customerId: string;
  paymentId: string;
  quantity: number;
  total: number;
  status: string;
  createdAt: string;
  customer: Customer;
  payment: Payment;
  shipment: Shipment;
}

export interface Payment {
  id: string;
  amount: number;
  reference: string;
  currency: string;
  status: string;
  transactionId: string;
  transaction: Transaction;
  wompiTransactionId?: string;
  token?: string;
  type?: string;
  installments?: number;
}

export interface Shipment {
  id: string;
  transactionId: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  status: string;
  transaction: Transaction;
}


## Instalación
 - Clona el repositorio
 - Instala las dependencias con `npm install`.
 - Configura las variables de entorno según el archivo `.env.example`

## Uso
Para iniciar la aplicación, ejecuta:
```
npm run start
```

## Test
Todos los test han sido ejecutados y pasaron con éxito, cubriendo los casos de uso de cada una de las rutas y operaciones críticas de la API. Los tests validan la funcionalidad de los controladores y repositorios, asegurando que la lógica de negocio y la integración con la base de datos funcionen como se espera.
