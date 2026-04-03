from __future__ import annotations

from .api_server import LocalTtsApiServer, configure_logging


def main() -> None:
    configure_logging()
    server = LocalTtsApiServer()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()


if __name__ == "__main__":
    main()
