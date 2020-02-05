local log = {}

function log.debug(label,msg)
	ngx.log(ngx.DEBUG,label,msg)
end

function log.err(sc,flag)
	local label = string.format("service sc: %s, ",sc)
	local msg = string.format("exception code：%s ;exception msg:%s",flag.code,flag.msg)
	ngx.log(ngx.ERR,label,msg)
end

function log.info(label,msg)
	ngx.log(ngx.INFO,label,msg)
end

return log