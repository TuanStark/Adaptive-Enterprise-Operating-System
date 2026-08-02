"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCorrelationId = exports.correlationStorage = exports.APP_LOGGER = void 0;
var logger_interface_1 = require("./logger.interface");
Object.defineProperty(exports, "APP_LOGGER", { enumerable: true, get: function () { return logger_interface_1.APP_LOGGER; } });
var correlation_storage_1 = require("./correlation-storage");
Object.defineProperty(exports, "correlationStorage", { enumerable: true, get: function () { return correlation_storage_1.correlationStorage; } });
Object.defineProperty(exports, "getCorrelationId", { enumerable: true, get: function () { return correlation_storage_1.getCorrelationId; } });
//# sourceMappingURL=index.js.map