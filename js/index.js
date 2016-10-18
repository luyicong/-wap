var index=(function(){
	//初始化
	function init(){
		navTab();
		scrollPic();
		navScroll();
		tab();
	}
	//顶部频道点击
	function navTab(){
		var oBtn = document.getElementById('channcel_btn');
		var oList = document.getElementById('channcel_list');
		var onOff = true;
		oBtn.addEventListener('touchstart',function(e){
			if(oBtn.className == 'channcel_btn_show'){
				oBtn.className = 'channcel_btn_close';
				oList.style.display="block";
			}else{
				oBtn.className = 'channcel_btn_show';
				oList.style.display="none";
			}
			e.stopPropagation();
		});
		document.addEventListener('touchstart',function(){
			if(oBtn.className == 'channcel_btn_close'){
				oBtn.className = 'channcel_btn_show';
				oList.style.display="none";
			}
			
		});
		oList.addEventListener('touchstart',function(e){
			e.stopPropagation();
		});
	}
	//图片幻灯片
	function scrollPic(){
		var oWrap = document.querySelector('#scrollWrap');
		var oList = document.querySelector('#picList');
		oList.innerHTML+=oList.innerHTML;
		var aLi = document.querySelectorAll('#picList li');
		var oNav = document.querySelectorAll('#btn span');
		var css = document.createElement('style');
		var timer = null;
		var iNow = 0;
		var style='#picList{width:'+aLi.length+'00%;}';
		style+='#picList li{width:'+1/aLi.length*100+'%;}';
		css.innerHTML+= style;
		document.head.appendChild(css);
		//手指的初始坐标
		var startPoint = 0;
		//元素初始移动的距离
		var startX = 0;
		var isMove = true;
		var isFirst = true;
		//启动移动设备硬件3D加速
		cssTransform(oList,'translateZ',0);
		cssTransform(oList,'translateX',0);
		
		autoPlay();
		
		oWrap.addEventListener('touchstart',function(e){
			clearInterval(timer);
			oList.style.WebkitTransition=oList.style.transition='none';
			var translateX = cssTransform(oList,'translateX');
			iNow = Math.round(-translateX/oWrap.offsetWidth);
			if(iNow==0){
				iNow=oNav.length;
			}
			if(iNow==aLi.length-1){
				iNow=oNav.length-1;
			}
			//启动移动设备硬件3D加速
			cssTransform(oList,'translateZ',0);
			cssTransform(oList,'translateX',-iNow*oWrap.offsetWidth);
			startPoint = e.changedTouches[0];
			startX = cssTransform(oList,'translateX');
			isMove = true;
			isFirst = true;
		});
		oWrap.addEventListener('touchmove',function(e){
			//如果isMove为假即表示上下滑动，return掉
			if(!isMove){
				return;
			}
			//当前移动位置的坐标
			var nowPoint = e.changedTouches[0];
			//X轴初始位置与移动位置的差值，求出移动的距离
			var disX = nowPoint.pageX - startPoint.pageX;
			//Y轴初始位置与移动位置的差值，求出移动的距离
			var disY = nowPoint.pageY - startPoint.pageY;
			//判断isFirst为真，只执行一次
			if(isFirst){
				isFirst = false;
				//是否是上下滑动
				if(Math.abs(disY) > Math.abs(disX)){
					isMove = false;
				}
			}
			if(isMove){
				//启动移动设备硬件3D加速
				cssTransform(oList,'translateZ',0);
				//元素总共移动的距离=之前的距离+当前移动的距离
				cssTransform(oList,'translateX',startX + disX);
			}
		});
		oWrap.addEventListener('touchend',function(){
			var translateX = cssTransform(oList,'translateX');
			iNow = Math.round(-translateX/oWrap.offsetWidth);
			play();
			autoPlay();
		});
		//自动播放
		function autoPlay(){
			clearInterval(timer);
			timer = setInterval(function(){
				if(iNow==aLi.length-1){
					iNow=oNav.length-1;
				}
				oList.style.WebkitTransition=oList.style.transition='none';
				//启动移动设备硬件3D加速
				cssTransform(oList,'translateZ',0);
				cssTransform(oList,'translateX',-iNow*oWrap.offsetWidth);
				iNow++;
				setTimeout(function(){
					play();
				},30);
			},2500);
		}
		
		function play(){
			oList.style.WebkitTransition=oList.style.transition='.5s';
			//启动移动设备硬件3D加速
			cssTransform(oList,'translateZ',0);
			cssTransform(oList,'translateX',-iNow*oWrap.offsetWidth);
			for(var i=0,len = oNav.length;i<len;i++){
				oNav[i].className = '';
			}
			oNav[iNow%oNav.length].className = 'active';
		}
	}
	//滑动导航
	function navScroll(){
		var oNavscroll = document.querySelector('#navScroll');
		var oNavlist = document.querySelector('#navList');
		var oStartpoint = 0;
		var oStartX = 0;
		var minX = oNavscroll.clientWidth - oNavlist.offsetWidth;
		var step = 1;
		var lastX = 0;
		var lastTime = 0;
		var lastDis = 0;
		var lastTimeDis = 0;
		// console.log(oNavscroll.clientWidth,oNavlist.offsetWidth,minX);
		oNavscroll.addEventListener('touchstart',function(e){
			oNavlist.style.WebkitTransition=oNavlist.style.transition='none';
			oStartpoint = e.changedTouches[0].pageX;
			oStartX = cssTransform(oNavlist,'translateX');
			// console.log(oStartpoint,oStartX);
			step = 1;
			lastX = oStartX;
			lastTime = new Date().getTime();
			lastDis = 0;
			lastTimeDis = 0;
		});
		oNavscroll.addEventListener('touchmove',function(e){
			var oNowpoint = e.changedTouches[0].pageX;
			var disX = oNowpoint - oStartpoint;
			// console.log(oNowpoint,disX);
			var moveLeft = oStartX+disX;
			var nowTime = new Date().getTime();
			//左边
			if(moveLeft > 0){
				//计算拉动超出长度系数大小，超出越大 系数越小
				step = 1-moveLeft / oNavscroll.clientWidth+.05;
				//设置滑动距离
				moveLeft = parseInt(moveLeft*step);
			}
			//右边
			if(moveLeft < minX){
				//计算超出值
				var over = minX - moveLeft;
				//根据超出值，计算拉动系数
				step = 1-over / oNavscroll.clientWidth+.05
				over = parseInt(over*step);
				//设置滑动距离
				moveLeft = minX - over;
			}
			lastDis = moveLeft - lastX;
			lastTimeDis = nowTime - lastTime;
			lastX = moveLeft;
			lastTime = nowTime;
			//启动移动设备硬件3D加速
			cssTransform(oNavlist,'translateZ',0);
			cssTransform(oNavlist,'translateX',moveLeft);
		});
		/*
		缓冲快慢：与移动的最后一次移动速度有关
		速度快缓冲距离就大，速度小缓冲距离就小
		速度 = 距离/时间
		距离 = 上次位置和移动后位置的差值
		时间 = 上次时间和移动后时间的差值
		 */
		oNavscroll.addEventListener('touchend',function(){
			//距离差值/时间差值=速度 速度*速度系数=缓冲速度
			var iSpeed = (lastDis/lastTimeDis)*200;
			//获取当前距离
			var moveLeft = cssTransform(oNavlist,'translateX');
			//目标点距离 = 当前距离+缓冲速度
			var target = moveLeft + iSpeed;
			var type='cubic-bezier(.34,.92,.58,.9)';
			var iTime = Math.abs(iSpeed*.9);
			iTime=iTime<500?500:iTime;
			//左边
			if(target > 0){
				target = 0;
				type = 'cubic-bezier(.08,1.24,.6,1)';
			//右边
			}
			if(target < minX){
				target = minX;
				type = 'cubic-bezier(.08,1.24,.6,1)';
			}
			oNavlist.style.WebkitTransition=oNavlist.style.transition=iTime+'ms '+type;
			//启动移动设备硬件3D加速
			cssTransform(oNavlist,'translateZ',0);
			cssTransform(oNavlist,'translateX',target);
			// console.log(lastDis,lastTimeDis,iSpeed);
		});
	}
	//滑动tab切换
	function tab(){
		var tabList = document.querySelectorAll('.groupComList');
		var tabNav = document.querySelectorAll('.gruopNav');
		var width = tabNav[0].offsetWidth;
		for(var i=0,len=tabNav.length;i<len;i++){
			swipe(tabNav[i],tabList[i]);
		}
		function swipe(nav,list){
			cssTransform(list,'translateX',-width);
			var startPoint = 0;
			//元素初始移动的距离
			var startX = 0;
			var iNow = 0;
			var isMove = true;
			var isFirst = true;
			var next = document.querySelectorAll('.listNext');
			var isLoad = false;
			var listNavA = nav.getElementsByTagName('a');
			var iSpanActive = nav.getElementsByTagName('span')[0];
			list.addEventListener('touchstart',function(e){
				if(isLoad){
					return;
				}
				list.style.WebkitTransition=list.style.transition='none';
				startPoint = e.changedTouches[0];
				startX = cssTransform(list,'translateX');
				isMove = true;
				isFirst = true;
			});
			list.addEventListener('touchmove',function(e){
				if(isLoad){
					return;
				}
				//如果isMove为假即表示上下滑动，return掉
				if(!isMove){
					return;
				}
				//当前移动位置的坐标
				var nowPoint = e.changedTouches[0];
				//X轴初始位置与移动位置的差值，求出X轴移动的距离
				var disX = nowPoint.pageX - startPoint.pageX;
				//Y轴初始位置与移动位置的差值，求出Y轴移动的距离
				var disY = nowPoint.pageY - startPoint.pageY;
				//判断isFirst为真，只执行一次
				if(isFirst){
					isFirst = false;
					//是否是上下滑动
					if(Math.abs(disY) > Math.abs(disX)){
						isMove = false;
					}
				}
				if(isMove){
					//元素总共移动的距离=之前的距离+当前移动的距离
					cssTransform(list,'translateX',startX + disX);
				}
				if(Math.abs(disX) > width/2){
					moveEnd(disX);
				}
			});
			list.addEventListener('touchend',function(){
				if(isLoad){
					return;
				}
				list.style.WebkitTransition=list.style.transition = '.3s';
				//启动移动设备硬件3D加速
				cssTransform(list,'translateZ',0);
				cssTransform(list,'translateX',-width);
			});
			function moveEnd(disX){
				isLoad = true;
				//通过正负值判断向左或向右
				var dir = disX/Math.abs(disX);
				var target = dir > 0?0:-2*width;
				iNow -= dir;
				if(iNow<0){
					iNow = listNavA.length-1;
				}
				if(iNow>listNavA.length-1){
					iNow = 0;
				}
				list.style.WebkitTransition=list.style.transition = '.5s';
				//启动移动设备硬件3D加速
				cssTransform(list,'translateZ',0);
				cssTransform(list,'translateX',target);
				list.addEventListener('webkitTransitionEnd',tranEnd);
				list.addEventListener('transitionend',tranEnd);
			}
			function tranEnd(){
				//获取导航移动距离
				var left = listNavA[iNow].offsetLeft;
				//启动移动设备硬件3D加速
				cssTransform(iSpanActive,'translateZ',0);
				//设置导航选中
				cssTransform(iSpanActive,'translateX',left);
				list.removeEventListener('webkitTransitionEnd',tranEnd);
				list.removeEventListener('transitionend',tranEnd);
				for(var i=0,len=next.length;i<len;i++){
					next[i].style.opacity = 1;
				}
				//模拟ajax重新加载效果，在工作中应该通过ajax请求数据通过修改listShow里面的内容后执行的代码
				setTimeout(function(){
					list.style.WebkitTransition=list.style.transition = 'none';
					//启动移动设备硬件3D加速
					cssTransform(list,'translateZ',0);
					cssTransform(list,'translateX',-width);
					isLoad = false;
					for(var i=0,len=next.length;i<len;i++){
						next[i].style.opacity = 0;
					}
				},800);
			}
		}
	}
	return{
		init:init
	}
})();