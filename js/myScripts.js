//RESTful Diablo App
//Author: Yixin Xia
//Date: 2014-04-19
//modulizer - avoided global pollution
//Main class for all the jsonp requests
//My account- StallmanExp-1277 by DEFAULT
var module = {
	accountName: 'StallmanExp-1277',
	//Below two variables will store json objects for future use
	accountSheet: {},
	characterSheet: [],
	//Able to add more properties in the future if needed
	getInfo: ['id'],
	//Character Main Info keys and visual values
	characterInfoList: ['id', 'name', 'level', 'paragonLevel', 'gender', 'class'],
	characterInfoListValue: ['ID', 'Name', 'Level', 'ParagonLevel', 'Gender', 'Class'],
	//Character Items keys and visual values
	itemsList: ['mainHand', 'offHand', 'head', 'torso', 'feet', 'hands', 'shoulders','legs', 'bracers', 'waist', 'rightFinger', 'leftFinger', 'neck'],
	itemsValue: ['Main Weapon', 'Offhand', 'Head', 'Torso', 'Feet', 'Gloves', 'Shoulders','Legs', 'Bracers', 'Waist', 'Right Finger', 'Left Finger', 'Amulet'],
	heroIDs: [],
	//counter hack to make sure all async are loaded
	itemCounters: {
		syncCounter: 0,
		asyncCounter: 0
	},
	//OOP Constructor for Heroes, in nice and scoped stack 
	HeroCon: function(){
		//Populate all the private variables - not necessary but make code easier to understand
		//PRIVATE Basics of character, populated in the 2nd ajax iteration
		var characterInfo = {
			id: 0,
			name: '',
			class: '',
			gender: 0,
			level: 0,
			paragonLevel: 0,
			damage: 0
		};
		//PRIVATE itemInfo store items as json objects, can extract more info out of it in the future
		var itemInfo = {
			mainHand: {},
			offHand: {},
			head: {},
			torso: {},
			feet: {},
			hands: {},
			shoulders: {},
			legs: {},
			bracers: {},
			waist: {},
			rightFinger: {},
			leftFinger: {},
			neck: {}
		};
		//PRIVATE itemDesc stores attributes and details of unique items, populated by 3rd ajax iteration
		var itemDesc = {
			mainHand: {},
			offHand: {},
			head: {},
			torso: {},
			feet: {},
			hands: {},
			shoulders: {},
			legs: {},
			bracers: {},
			waist: {},
			rightFinger: {},
			leftFinger: {},
			neck: {}
		};
		//PUBLIC Methods for UPDATE private variables
		this.updateCharacterInfo = function(key, data){
			characterInfo[key]=data;
		};
		this.updateItemInfo = function(key, data){
			itemInfo[key]=data;
		};
		this.updateItemDesc = function(key, data){
			itemDesc[key]=data;
		};
		//PUBLIC Methods for READ
		this.returnCharacterInfo = function(key){
			return characterInfo[key];
		};
		this.returnCharacterGender = function(){
			if (characterInfo.gender===0){
				return 'Male';
			}else{
				return 'Female';
			}
		};
		this.returnItemInfo = function(key){
			return itemInfo[key];
		};
		this.returnItemImage = function(key){
			//prevent return of undefined variables - some characters don't have offhand, or amor yet
			try{
				return '<img src="http://media.blizzard.com/d3/icons/items/large/' + itemInfo[key].icon + '.png" alt="Item" />';
			}catch(e){
				return 0;
			}
		};
		this.returnItemParm = function(key){
			//prevent return of undefined variables - some characters don't have offhand, or amor yet
			try {
				var itemParm = itemInfo[key].tooltipParams;
				return itemInfo[key].tooltipParams;
			} catch(e) {
				return 0;
			}
		};
		this.returnItemDesc = function(key){
			return itemDesc[key];
		};
		//Returns the attributes of the item. Each unique item has its own rest call
		this.returnItemDescAttributes = function(key){
			try{
				var itemDescPrimary = '';
				var itemDescSecondary = '';
				//Primary attributes of item = 4?
				$.each(itemDesc[key].attributes.primary, function(i, data){
					itemDescPrimary+=(data.text + '<br/>');
				});
				//Secondary attributes of item = 2?
				$.each(itemDesc[key].attributes.secondary, function(i, data){
					itemDescSecondary+=(data.text + '<br/>');
				});
				if (itemDescPrimary || itemDescSecondary){
					return itemDescPrimary + '<br/>' + itemDescSecondary;
				}else{
					return 0;
				}
			} catch(e){
				return 0;
			}
		};
		//Able to add more PUBLIC methods if needed in the future
	},
	//Array to store hero objects
	heroesArray: [],
	//Run Order : 1
	getJSON: function(){
		$.ajax({ 
		   type: "GET",
		   dataType: "jsonp",
		   url: "http://us.battle.net/api/d3/profile/"+ module.accountName +"/",
		   success: module.getJSONCallback.process_requests
		});
	},
	//Callback functions to run in particular order after first getJSON is ran
	getJSONCallback: {
		//Run Order : 2
		process_requests: function(data){
			module.accountSheet=data;
			//Populate the chartacter ID fields
			$.each(module.accountSheet.heroes, function(i, data){
				module.heroIDs.push(data.id);
			});
			//process each of the ajax request per id provided above
			var proceeAjax = [];
			$.each(module.heroIDs, function(i, data){
				proceeAjax.push(
					$.ajax({ 
					   type: "GET",
					   dataType: "jsonp",
					   url: "http://us.battle.net/api/d3/profile/"+ module.accountName +"/hero/" + data,
					   success: function(data){
							module.characterSheet.push(data);
					   }
					})
				);
			});
			//when fnally done it moves to next callback - start creating multiple Hero objects
			$.when.apply($, proceeAjax).then(function () {
				console.log('All heroes loaded');
				$.each(module.characterSheet, function(i, data){;
					module.getJSONCallback.updateCharactersAfterCreation(data);
				});
			})
		},
		//Order : 3
		updateCharactersAfterCreation: function(data){
			//Creates a new HeroCon object and push into heroesArray list
			var currentHero = new module.HeroCon();
			module.heroesArray.push(currentHero);
			//Update hero object's information - use list of parameters to run in characterInfoList
			$.each(module.characterInfoList, function(i, d1){
				currentHero.updateCharacterInfo(d1, data[d1]);
			});
			//Update hero's dps - can be integrated with other properties in the future
			currentHero.updateCharacterInfo('damage', data.stats.damage);
			//Update hero object's item list
			$.each(module.itemsList, function(i, d1){
				currentHero.updateItemInfo(d1, data.items[d1]);
			});
			//Update hero object's item description - new ajax open
			$.each(module.itemsList, function(i, d1){
				var itemSelected, itemDesc
				itemSelected = currentHero.returnItemParm(d1);
				if (itemSelected){
					module.itemCounters.syncCounter++;
					itemDesc = module.getJSONCallback.getItemDescJSON(itemSelected, currentHero, d1);
				}
			});
		},
		//Order :4 looped for each item on each character on the account
		getItemDescJSON: function(key, currentHero, currentItem){
			$.ajax({ 
			   type: "GET",
			   dataType: "jsonp",
			   url: "http://us.battle.net/api/d3/data/" + key,
			   success: function(data){
				    //populate all the item descriptions with json data
					currentHero.updateItemDesc(currentItem, data);
					//check to see if all the item desc has been populated, if so GOOD TO GO
					module.itemCounters.asyncCounter++;
					if (module.itemCounters.asyncCounter===module.itemCounters.syncCounter){
						//FINAL CALLBACK - AT THIS POINT ALL DATA HAS BEEN LOADED - GAH SPAGHETTI CODE =(
						console.log('All items loaded - good to go!');
						module.dataBinding.removeWaiting();
						module.dataBinding.updateNavPanel();
						module.dataBinding.updateCharacterPanels();
						module.dataBinding.updateHeroBar();
						domFunctions();
					}
			   }
			});
		}
	},
	//All the databinding goes in this subclass
	dataBinding: {
		removeWaiting: function(){
			$('#waiting').fadeOut(500);
		},
		//Update the navigation panel with all the character info
		updateNavPanel: function(){
			var liElements = '';
			$.each(module.heroIDs, function(i, data){
				liElements += '<li><a href="#" class="heroLiEle" data-char="' + module.heroesArray[i].returnCharacterInfo('id') +'">' + module.heroesArray[i].returnCharacterInfo('name') + ' (Lv' +module.heroesArray[i].returnCharacterInfo('level') + ' ' + module.heroesArray[i].returnCharacterInfo('class') + ') ' + '</a></li>';
			});
			$('.navPanelul').append(liElements);
		},
		//Updates the hero bar with necessary elements
		updateHeroBar: function(){
			$('.heroBarName').append(module.accountName);
			$('.heroBarCharNum').append(module.heroIDs.length);
		},
		//Update the character panel with necessary info
		updateCharacterPanels: function(){
			var divElements = '';
			$.each(module.heroIDs, function(i, data){
				divElements += '<div class="span8 hidden ' +  module.heroesArray[i].returnCharacterInfo('id') + '">';
				 //List out all basic character infos
				 divElements += '<h2>' + module.heroesArray[i].returnCharacterInfo('name') + '</h2>';
				 divElements += '<h4> Class: '  + module.heroesArray[i].returnCharacterInfo('class') + '</h4>';
				 divElements += '<h4> Level: '  + module.heroesArray[i].returnCharacterInfo('level') + '</h4>';
				 divElements += '<h4> Paragon Level: '  + module.heroesArray[i].returnCharacterInfo('paragonLevel') + '</h4>';
				 divElements += '<h4> Class: '  + module.heroesArray[i].returnCharacterInfo('class') + '</h4>';
				 divElements += '<h4> Gender: ' + module.heroesArray[i].returnCharacterGender() + '</h4>';
				 divElements += '<h4> DPS: '  + module.heroesArray[i].returnCharacterInfo('damage') + '</h4>';
				 //Loops through each item type, this is looped by number of character someone has
				 $.each(module.itemsList, function(ii, data){
					 //List out all item infos
					 var itemImage, itemDesc;
					 //Do a quick parsing on no item found/no stats found
					 if (module.heroesArray[i].returnItemImage(data)){
						 itemImage = module.heroesArray[i].returnItemImage(data);
					 }else{
						 itemImage = 'No Item';
					 }
					 if (module.heroesArray[i].returnItemDescAttributes(data)){
						 itemDesc = module.heroesArray[i].returnItemDescAttributes(data);
					 }else{
						 itemDesc = 'No Stats';
					 }
					 //push in rest of the values
					 divElements += '<div class="itemContainer">';
						 divElements += '<div class="row">';
							divElements += '<div class="span2 itemType">';
								divElements += module.itemsValue[ii];
							divElements += '</div>';
							divElements += '<div class="span2 itemImage">';
								divElements+= itemImage;
							divElements += '</div>';
							divElements += '<div class="span4 itemDesc">';
								divElements+= itemDesc;
							divElements += '</div>';
						 divElements += '</div>';
						divElements += '</div>';
				 });
				 divElements += '</div>';
			});
			$('.characterPanels').append(divElements);
		}
	}
};

//DOM Manipulation class functions
var domFunctions = function(e){
	//Handles what happens when user click on the nav menu
	$('.heroLiEle').on('click', function(e){
		//only run if doesnt have class active yet
		if(!$(this).parent().hasClass('active')){
			var heroId = $(this).data('char');
			//fade everything else out while fading in the heroId
			$('.characterPanels>div').fadeOut(100);
			$('.'+heroId).fadeIn(100);
			$('.heroLiEle').parent().removeClass('active');
			$(this).parent().toggleClass('active');
		}
		e.preventDefault();
	});
	//handles user searching by bid
	$('#battletagSubmit').on('click', function(e){
		var bidTag = $('#formID').val();
		$.ajax({ 
		   type: "GET",
		   dataType: "jsonp",
		   url: "http://us.battle.net/api/d3/profile/"+ bidTag +"/",
		   success: function(data){
			   if(data.code==='NOTFOUND'){
				   $('#formID').addClass('error');
			   }else{
				   window.location.replace('index.html?bid=' + bidTag);
			   }
		   }
		});
		e.preventDefault();
	});
}

//too lazy to write my own url decoder. This should really be in a module/class, but oh well
function gup(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null) return "";
    else return results[1];
}

//DOM elements for after loading
$( document ).ready(function() {
	//Initialize all the ajax requests if there's a battletag
	var getAccountName = gup('bid');
	if(getAccountName){
		module.accountName=getAccountName;
		module.getJSON();
	}else if (getAccountName===''){
		module.getJSON();
	}else{
		$('.waitHeader').html('Can\'t load battletag');
	}
});
