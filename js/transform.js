//使用规则：如果要获取transform的属性值，就必须先通过此函数设置transform的属性值
function cssTransform(el,attr,val) {
	if(!el.transform){
		el.transform = {};
	}
	if(arguments.length>2) {
		el.transform[attr] = val;
		var sVal = "";
		for(var s in el.transform){
			switch(s) {
				case "rotate":
				case "skewX":
				case "skewY":
					sVal +=s+"("+el.transform[s]+"deg) ";
					break;
				case "translateX":
				case "translateY":
				case "translateZ":
					sVal +=s+"("+el.transform[s]+"px) ";
					break;
				case "scaleX":
				case "scaleY":
				case "scale":
					sVal +=s+"("+el.transform[s]+") ";
					break;	
			}
			el.style.WebkitTransform = el.style.transform = sVal;
		}
	} else {
		val  = el.transform[attr];
		if(typeof val == "undefined" ) {
			if(attr == "scale" || attr == "scaleX" || attr == "scaleY"  ) {
				val = 1;
			} else {
				val = 0;
			}
		}
		return val;
	}
}
//页面滑动以及自定义滚动条
function mScrollFn(wrap,callBack){
		var oScroll = wrap.querySelector('#scrollCon');
		var oStartpoint = 0;
		var oStartY = 0;
		var minY = wrap.clientHeight - oScroll.offsetHeight;
		var step = 1;
		var lastY = 0;
		var lastTime = 0;
		var lastDis = 0;
		var lastTimeDis = 1;
		var isMove = true;
		var isFirst = true;
		var Tween = {
			easeOut:function(t,b,c,d){
				return -c*( (t=t/d-1)*t*t*t-1 )+b;
			},
			backOut:function(t,b,c,d,s){
				if(typeof s == 'undefined'){
					s = 2.70158;
				}
				return c*((t=t/d-1)*t*((s+1)*t + s)+1)+b;
			}
		}
		// console.log(wrap.clientHeight,oScroll.offsetHeight,minY);
		wrap.addEventListener('touchstart',function(e){
			clearInterval(oScroll.timer);
			if(callBack&&callBack.startFn){
				callBack.startFn();
			}
			oScroll.style.WebkitTransition=oScroll.style.transition='none';
			oStartpoint = {pageY:e.changedTouches[0].pageY,pageX:e.changedTouches[0].pageX};
			oStartY = cssTransform(oScroll,'translateY');
			// console.log(oStartpoint,oStartY);
			step = 1;
			lastY = oStartpoint.pageY;
			lastTime = new Date().getTime();
			lastDis = 0;
			lastTimeDis = 1;
			isMove = true;
			isFirst = true;
		});
		wrap.addEventListener('touchmove',function(e){
			//如果isMove为假即表示上下滑动，return掉
			if(!isMove){
				return ;
			}
			var oNowpoint = e.changedTouches[0];
			var disX = oNowpoint.pageX - oStartpoint.pageX;
			var disY = oNowpoint.pageY - oStartpoint.pageY;
			if(isFirst){
				isFirst = false;
				//是否是上下滑动
				if(Math.abs(disY) < Math.abs(disX)){
					isMove = false;
					return ;
				}
			}
			// console.log(oNowpoint,disY);
			var moveLeft = oStartY+disY;
			var nowTime = new Date().getTime();
			
			//左边
			if(moveLeft > 0){
				//计算拉动超出长度系数大小，超出越大 系数越小
				step = 1-moveLeft / wrap.clientHeight+.05;
				//设置滑动距离
				moveLeft = parseInt(moveLeft*step);
			}
			//右边
			if(moveLeft < minY){
				//计算超出值
				var over = minY - moveLeft;
				//根据超出值，计算拉动系数
				step = 1-over / wrap.clientHeight+.05
				over = parseInt(over*step);
				//设置滑动距离
				moveLeft = minY - over;
			}
			lastDis = oNowpoint.pageY - lastY;
			lastTimeDis = nowTime - lastTime;
			lastY = oNowpoint.pageY;
			lastTime = nowTime;
				//移动设备启动3d硬件加速
				cssTransform(oScroll,'translateZ',-0.001);
				cssTransform(oScroll,'translateY',moveLeft);
				if(callBack&&callBack.onFn){
					callBack.onFn();
				}
			
		});
		/*
		缓冲快慢：与移动的最后一次移动速度有关
		速度快缓冲距离就大，速度小缓冲距离就小
		速度 = 距离/时间
		距离 = 上次位置和移动后位置的差值
		时间 = 上次时间和移动后时间的差值
		 */
		wrap.addEventListener('touchend',function(){
			//距离差值/时间差值=速度 速度*速度系数=缓冲速度
			var iSpeed = (lastDis/lastTimeDis)*280;
			//获取当前距离
			var moveLeft = cssTransform(oScroll,'translateY');
			//目标点距离 = 当前距离+缓冲速度
			var target = moveLeft + iSpeed;
			var type='easeOut';
			var iTime = Math.abs(iSpeed*.8);
			iTime=iTime<500?500:iTime;
			//左边
			if(target > 0){
				target = 0;
				type = 'backOut';
			//右边
			}
			if(target < minY){
				target = minY;
				type = 'easeOut';
			}
			oScroll.style.WebkitTransition=oScroll.style.transition=iTime+'ms '+type;
			//移动设备启动3d硬件加速
			// cssTransform(oScroll,'translateZ',0.01);
			// cssTransform(oScroll,'translateY',target);
			// console.log(lastDis,lastTimeDis,iSpeed);
			move(target,iTime,type);
		});
		function move(target,iTime,type){
			var t  = 0;
			var b = cssTransform(oScroll,'translateY');
			var c = target - b;
			var d = Math.ceil(iTime/20);
			clearInterval(oScroll.timer);
			oScroll.timer = setInterval(function(){
				t++;
				if(t > d){
					clearInterval(oScroll.timer);
					if(callBack&&callBack.overFn){
						callBack.overFn();
					}
				}else{
					var iTop = Tween[type](t,b,c,d);
					cssTransform(oScroll,'translateZ',-0.001);
					cssTransform(oScroll,'translateY',iTop);
					if(callBack&&callBack.onFn){
						callBack.onFn();
					}
				}
			},20);
		}
	}

