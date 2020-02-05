--[[
该模块主要用来处理请求字段
--]]
local utils = require("linxsh.utils.utils")
local core_handler = require "linxsh.core.core_handler"
local analysis = {}

function analysis.parse(args)
	local ec = args["ec"]
	local ea = args["ea"]
	if args["uvi"] == nil or args["uvi"] == "" then
		args["uvi"] = generateUvi(args)
	end
	--重新封装参数
	local result = core_handler.extractActionProperty(args)
	--local action = core_handler.parseActionData(utils.uri.buildQuery(result))
	local action = core_handler.parseActionData(result)
end

--[[
	生成访客标识
--]]
function generateUvi(args)
	local str = ngx.var.http_user_agent
	local shw = args["shw"] == nil and "-" or args["shw"] 
	local cd = args["cd"] == nil and "-" or args["cd"] 
	local sc = args["sc"] 
	str = str..shw..cd..sc
	return ngx.md5(str)
end

return analysis