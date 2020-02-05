local utils = require "linxsh.utils.utils"
local base64 = require "linxsh.utils.Base64"

local uri = {}

--[[
解析请求资源
--]]
function uri.parseUri()
	return utils.uri.getQueryAsTable()
end

return uri