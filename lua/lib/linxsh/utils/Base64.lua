local base64 = {}

local ENCODE_CHARS = {
["+"] = "-",
["/"] = "_",
["="] = "."
}

local DECODE_CHARS = {
["-"] = "+",
["_"] = "/",
["."] = "="
}

--[[
base64url±àÂë
--]]
function base64.encode_base64url(value)
	return (ngx.encode_base64(value):gsub("[+/=]", ENCODE_CHARS))
end

--[[
base64url½âÂë
--]]
function base64.decode_base64url(value)
	return ngx.decode_base64((value:gsub("[-_.]", DECODE_CHARS)))
end

--[[
base64±àÂë
--]]
function base64.encode_base64(value)
	return ngx.encode_base64(value)
end

--[[
base64½âÂë
--]]
function base64.decode_base64(value)
	return ngx.decode_base64(value)
end

return base64