+++
title = 'Mastering OpenAPI Generator'
date = '2023-10-16T16:56:35+09:00'
description = "Learn about the differences between Swagger and OpenAPI Generator, and compare tools for API documentation automation."
summary = "API documentation automation and code generation using OpenAPI Generator"
categories = ["Backend"]
tags = ["Swagger", "OpenAPI", "API", "Documentation", "Code Generation"]
series = []
series_order = 1

draft = false
+++

## What is Swagger?

**Swagger** is a framework for OAS (OpenAPI Specification) that allows you to specify and manage the specifications of APIs. Through Swagger, you can design, build, and document REST API services.

### Swagger Tools

Swagger provides the following key tools

- **Swagger UI**: A tool that visualizes Swagger API specifications in HTML format for easy viewing
- **Swagger Codegen**: A CLI tool that automatically generates client and server code based on Swagger specifications
- **Swagger Editor**: An editor for creating API design documents and specifications according to Swagger standards

### Springfox vs Springdoc

**Springfox Swagger** is a library that helps you easily write API documentation using Swagger in projects using Spring or Spring Boot.

When Springfox stopped updating, **Springdoc** emerged and rapidly gained popularity with active updates. Springdoc is also a library that supports Swagger documentation creation and is now the more recommended choice over Springfox.

---

## Swagger Codegen vs OpenAPI Generator

**Swagger** is a trademark of SmartBear, and **Swagger Codegen** is a project included within it.

**OpenAPI Generator** is a community-driven open-source project that started as a fork of the Swagger Codegen project. Currently, more than 40 top project contributors and founding members of Swagger Codegen are participating together.

### OpenAPI Generator License

OpenAPI Generator follows **Apache License 2.0**.

#### What is Apache License 2.0?

Apache License 2.0 grants the following rights

- Anyone can create programs derived from the software
- Copyright can be transferred and transmitted
- Parts or the whole can be used for personal or commercial purposes
- When redistributing, you don't necessarily have to include the original or modified source code
- **However, you must include the Apache License version and notice** (clearly indicating that the software was developed under Apache License)

### Background of OpenAPI Generator's Birth

The official Q&A of OpenAPI Generator reveals the background of the project's creation

1. **Difference in Version Philosophy**
   The founding members of Swagger Codegen felt that Swagger Codegen 3.0.0 was too different from the 2.x philosophy. They were concerned that the overhead of maintaining two separate branches (2.x, 3.x) could cause problems similar to those experienced by the Python community.

2. **Faster Release Cycle**
   The founding members wanted a faster release cycle so users wouldn't have to wait months to use the stable release version they wanted.
   - Weekly patch releases
   - Monthly minor releases

3. **Community-Driven Development**
   Proceeding as a community-driven open-source project ensures innovation, reliability, and a roadmap owned by the community.

For these reasons, the OpenAPI Generator project was born. OpenAPI Generator feels somewhat like the relationship between MySQL and MariaDB.

### Migrating from Swagger Codegen

According to the official documentation, if you're currently using Swagger Codegen 2.x version, you can conveniently migrate to OpenAPI Generator. This is because OpenAPI Generator is based on Swagger Codegen 2.4.0-SNAPSHOT version.

For detailed migration instructions, refer to the official guide

- [Migrating from Swagger Codegen | OpenAPI Generator](https://openapi-generator.tech/docs/swagger-codegen-migration)

---

## References

- [OpenAPI Generator Official Site](https://openapi-generator.tech/)
- [Migrating from Swagger Codegen](https://openapi-generator.tech/docs/swagger-codegen-migration)
