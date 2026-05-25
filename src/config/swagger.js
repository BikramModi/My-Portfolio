import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MERN PORTFOLIO API",
      version: "1.0.0",
      description: "API documentation for MERN PORTFOLIO with JWT Cookie Auth",
    },
    servers: [
      {
        url: "http://localhost:3001",
      },
    ],

    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken",
        },
      },

      schemas: {
        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "65f2c8b5d4e123456789abcd",
            },
            name: {
              type: "string",
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            role: {
              type: "string",
              enum: ["user", "admin", "moderator"],
              example: "user",
            },
            status: {
              type: "string",
              enum: ["active", "suspended", "deleted"],
              example: "active",
            },
            emailVerified: {
              type: "boolean",
              example: false,
            },
            lastLoginAt: {
              type: "string",
              format: "date-time",
              example: "2026-02-20T10:00:00.000Z",
            },
            phone: {
              type: "string",
              example: "+1234567890",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },

        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password" },
            phone: { type: "string" },
          },
        },

        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", format: "password" },
          },
        },
      },
    },

    security: [
      {
        cookieAuth: [],
      },
    ],

    tags: [{ name: "Users" }, { name: "Auth" }],
  },

  apis: ["./src/handlers/*.js"], // <-- Point to your route handler files with JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
