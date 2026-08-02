"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.ForbiddenError = exports.ConflictError = exports.NotFoundError = exports.DomainError = exports.Result = void 0;
var result_1 = require("./result");
Object.defineProperty(exports, "Result", { enumerable: true, get: function () { return result_1.Result; } });
var domain_error_base_1 = require("./domain-error.base");
Object.defineProperty(exports, "DomainError", { enumerable: true, get: function () { return domain_error_base_1.DomainError; } });
Object.defineProperty(exports, "NotFoundError", { enumerable: true, get: function () { return domain_error_base_1.NotFoundError; } });
Object.defineProperty(exports, "ConflictError", { enumerable: true, get: function () { return domain_error_base_1.ConflictError; } });
Object.defineProperty(exports, "ForbiddenError", { enumerable: true, get: function () { return domain_error_base_1.ForbiddenError; } });
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return domain_error_base_1.ValidationError; } });
//# sourceMappingURL=index.js.map