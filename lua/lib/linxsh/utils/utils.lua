local utils = {}
utils.string = {}

--[[
去除字符串两边的空格
--]]
function utils.string.trim(s) 
	if s == nil then
		return ""
	end
	return (string.gsub(s, "^%s*(.-)%s*$", "%1"))
end

--[[
判断字符串是否为空
--]]
function utils.string.isBlank(str)
	if str == nil or str == "-" then
		return true;
	end
	str = utils.string.trim(str)
	if #str > 0 then
		return false
	else
		return true
	end
end

--[[
	将字符串转换为数组
--]]
function utils.string.split(szFullString, szSeparator)  
	local nFindStartIndex = 1  
	local nSplitIndex = 1  
	local nSplitArray = {}  
	while true do  
		local nFindLastIndex = string.find(szFullString, szSeparator, nFindStartIndex)  
		if not nFindLastIndex then  
			nSplitArray[nSplitIndex] = string.sub(szFullString, nFindStartIndex, string.len(szFullString))  
			break  
		end  
		nSplitArray[nSplitIndex] = string.sub(szFullString, nFindStartIndex, nFindLastIndex - 1)  
		nFindStartIndex = nFindLastIndex + string.len(szSeparator)  
		nSplitIndex = nSplitIndex + 1  
	end  
	return nSplitArray  
end

utils.uri = {}

--[[
	获取get请求的参数
--]]
function utils.uri.getQueryAsTable()
	return ngx.req.get_uri_args()
end

--[[
	根据key值获取get请求的参数
--]]
function utils.uri.getQueryParamByKey(k)
	local args = utils.uri.getQueryAsTable()
	return args[k]
end

--[[
	将table值转换为&间隔串
--]]
function utils.uri.parseQueryAsTable(query)
	local args = utils.string.split(query,"&")
	local queryTable = {}
	for key, val in pairs(args) do
		local a = utils.string.split(val,"=")
		queryTable[a[1]] = a[2]
	end
	return queryTable
end

--[[
	将table值转换为&间隔串
--]]
function utils.uri.buildQuery(args)
	local query = ""
	for key, val in pairs(args) do
		query = query.."&"..key.."="..val
	end
	query = string.sub(query, 2)
	return query
end

function utils.decodeURI(s)
    s = string.gsub(s, '%%(%x%x)', function(h) return string.char(tonumber(h, 16)) end)
    return s
end

function utils.encodeURI(s)
    s = string.gsub(s, "([^%w%.%- ])", function(c) return string.format("%%%02X", string.byte(c)) end)
    return string.gsub(s, " ", "+")
end

return utils