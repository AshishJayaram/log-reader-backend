## Description

🚗 Vehicle Diagnostics & Configuration Dashboard
This project allows uploading, storing, filtering, and browsing vehicle diagnostic logs. Built with a NestJS backend and an Angular frontend powered by signals for fast and reactive UI state management.

Backend: NestJS, TypeORM, SQLite, Swagger (OpenAPI)

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start
```

## API Documentation in http://localhost:3000/api#/

## Design Decisions

Modular Architecture
Each feature is encapsulated (logs controller, service, entity)

 SQLite + TypeORM
Easy to set up, inspect (logs.db)
Entity-based mapping with LogEntry
Timestamp stored as string to match log file format


## Assumptions
Log format is strictly:
[timestamp] [VEHICLE_ID:x] [LEVEL] [CODE:x] [message]
timestamp is stored as string but always ISO-compatible
Large log files are not chunked — handled in-memory before batch save
Sorting is primarily based on timestamp
Pagination defaults to page=1&limit=10
