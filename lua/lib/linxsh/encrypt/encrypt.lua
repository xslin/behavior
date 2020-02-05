local encrypt = {}
--1.根据table的key进行升序排序
--2.按照排序后的key的顺序获取对应的value
--3.将获取到的值按照获取顺序进行字符串拼接
--4.使用md5得到加密传
function encrypt.encrypt(args)
	local str = "";
	local a = {}
	--遍历参数名，添加到表a中，其中的si不存放到a中
	for key, val in pairs(args) do
		ngx.log(ngx.ERR, key..":", val)
		if key ~= "si" then
			table.insert(a,key)
		end
	end
	--将a的内容按照升序的形式排序
	table.sort(a)
	--按照排序好参数名逐个获取对应的值，并且拼接在一起
	for key,val in pairs(a)  do
		str = str..args[val]
	end
	--将参数值与签名密钥拼接在一起
	--进行md5加密，生成32位的小写签名串
	local sis = ngx.md5(str)
	return sis
end

--[[
比较签名是否正确
--]]
function encrypt.checkSign(args,si)
	--获取签名
	local sis = encrypt.encrypt(args)
	local rsi = string.lower(si)
	sis = string.lower(sis)
	if string.match(sis,rsi)~=nil then
		return true
	else
		return false
	end
end



return encrypt