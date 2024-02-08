# WHERE Ping API

```mermaid
sequenceDiagram
    participant Client as Trackee ping service
    participant Server as Server
    participant DB as Database

    Client ->> Server: POST /ping with location data
    Server ->> DB: Store location data
```
