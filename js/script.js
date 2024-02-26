$('document').ready(function(){
	
});

//Для выподающего под-меню

"use strict"


//Прокрутка при клике

//Для начала я ищу все объекты с классом .menu_link, но с data-атрибутом data-goto
const menuLinks = document.querySelectorAll('[data-goto]');
//Проверяю есть ли у нас что нибудь из этого
if (menuLinks.length > 0) {
	//Пробежимся по ним
	menuLinks.forEach(menuLink => {
		//И вешаем событие клик при котором вызываем функцию onMenuLinkClick
		menuLink.addEventListener("click", onMenuLinkClick);
	});

		function onMenuLinkClick(e) {
			//Сдесь нам нужно получить объект на который мы кликаем
			const menuLink = e.target;
			//Далее важное условие
			//во первых проверяю заполнен ли этот дата атрибут, и проверяю существует ли объект на который ссылается данный дата-атрибут
			if (menuLink.dataset.goto && document.querySelector(menuLink.dataset.goto)) {
				//Далее получаю в константу этот объект
				const gotoBlock = document.querySelector(menuLink.dataset.goto);
				//Далее нам нужно высчитать положение этого объекта с учётом высоты шапки
				//с помощью getBoundingClientRect().top я получаю его местоположение на странице в пикселях, далее я прибавляю колличество прокрученных пикселей
				//и далее я убавляю высоту шапки
				const gotoBlockValue = gotoBlock.getBoundingClientRect().top + pageYOffset - document.querySelector('header').offsetHeight;


				//Закрытие меню при клике на li
				if (iconMenu.classList.contains('_active')) {
					document.body.classList.remove('_lock');
					iconMenu.classList.remove('_active');
					menuBody.classList.remove('_active');
				}

				//Далее код который заставит скролл прокрутиться к нужному месту
				window.scrollTo({
					top: gotoBlockValue,
					behavior: "smooth"
				});
				//добавим e.preventDefault(); для того чтобы отключить работу ссылок
				e.preventDefault();
			}
		}
	
}


//Меню бургер
const iconMenu = document.querySelector('.menu_icon');
const menuBody = document.querySelector('.menu_body');
if(iconMenu) {
	iconMenu.addEventListener("click", function(e) {
		document.body.classList.toggle('_lock');
		iconMenu.classList.toggle('_active');
		menuBody.classList.toggle('_active');
	});
}




/*Динимический адаптив*/
/**
 * @typedef {Object} dNode
 * @property {HTMLElement} parent
 * @property {HTMLElement} element
 * @property {HTMLElement} to
 * @property {string} breakpoint
 * @property {string} order
 * @property {number} index
 */

/**
 * @typedef {Object} dMediaQuery
 * @property {string} query
 * @property {number} breakpoint
 */

/**
 * @param {'min' | 'max'} type
 */
function useDynamicAdapt(type = 'max') {
    const className = '_dynamic_adapt_'
    const attrName = 'data-da'
  
    /** @type {dNode[]} */
    const dNodes = getDNodes()
  
    /** @type {dMediaQuery[]} */
    const dMediaQueries = getDMediaQueries(dNodes)
  
    dMediaQueries.forEach((dMediaQuery) => {
      const matchMedia = window.matchMedia(dMediaQuery.query)
      // массив объектов с подходящим брейкпоинтом
      const filteredDNodes = dNodes.filter(({ breakpoint }) => breakpoint === dMediaQuery.breakpoint)
      const mediaHandler = getMediaHandler(matchMedia, filteredDNodes)
      matchMedia.addEventListener('change', mediaHandler)
  
      mediaHandler()
    })
  
    function getDNodes() {
      const result = []
      const elements = [...document.querySelectorAll(`[${attrName}]`)]
  
      elements.forEach((element) => {
        const attr = element.getAttribute(attrName)
        const [toSelector, breakpoint, order] = attr.split(',').map((val) => val.trim())
  
        const to = document.querySelector(toSelector)
  
        if (to) {
          result.push({
            parent: element.parentElement,
            element,
            to,
            breakpoint: breakpoint ?? '767',
            order: order !== undefined ? (isNumber(order) ? Number(order) : order) : 'last',
            index: -1,
          })
        }
      })
  
      return sortDNodes(result)
    }
  
    /**
     * @param {dNode} items
     * @returns {dMediaQuery[]}
     */
    function getDMediaQueries(items) {
      const uniqItems = [...new Set(items.map(({ breakpoint }) => `(${type}-width: ${breakpoint}px),${breakpoint}`))]
  
      return uniqItems.map((item) => {
        const [query, breakpoint] = item.split(',')
  
        return { query, breakpoint }
      })
    }
  
    /**
     * @param {MediaQueryList} matchMedia
     * @param {dNodes} items
     */
    function getMediaHandler(matchMedia, items) {
      return function mediaHandler() {
        if (matchMedia.matches) {
          items.forEach((item) => {
            moveTo(item)
          })
  
          items.reverse()
        } else {
          items.forEach((item) => {
            if (item.element.classList.contains(className)) {
              moveBack(item)
            }
          })
  
          items.reverse()
        }
      }
    }
  
    /**
     * @param {dNode} dNode
     */
    function moveTo(dNode) {
      const { to, element, order } = dNode
      dNode.index = getIndexInParent(dNode.element, dNode.element.parentElement)
      element.classList.add(className)
  
      if (order === 'last' || order >= to.children.length) {
        to.append(element)
  
        return
      }
  
      if (order === 'first') {
        to.prepend(element)
  
        return
      }
  
      to.children[order].before(element)
    }
  
    /**
     * @param {dNode} dNode
     */
    function moveBack(dNode) {
      const { parent, element, index } = dNode
      element.classList.remove(className)
  
      if (index >= 0 && parent.children[index]) {
        parent.children[index].before(element)
      } else {
        parent.append(element)
      }
    }
  
    /**
     * @param {HTMLElement} element
     * @param {HTMLElement} parent
     */
    function getIndexInParent(element, parent) {
      return [...parent.children].indexOf(element)
    }
  
    /**
     * Функция сортировки массива по breakpoint и order
     * по возрастанию для type = min
     * по убыванию для type = max
     *
     * @param {dNode[]} items
     */
    function sortDNodes(items) {
      const isMin = type === 'min' ? 1 : 0
  
      return [...items].sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.order === b.order) {
            return 0
          }
  
          if (a.order === 'first' || b.order === 'last') {
            return -1 * isMin
          }
  
          if (a.order === 'last' || b.order === 'first') {
            return 1 * isMin
          }
  
          return 0
        }
  
        return (a.breakpoint - b.breakpoint) * isMin
      })
    }
  
    function isNumber(value) {
      return !isNaN(value)
    }
  }
  
useDynamicAdapt();







/*Elastick search*/

/*document.querySelector('#elastic').oninput = function () {
	let val = this.value.trim();
	let elasticItems = document.querySelectorAll('.elastic');
	if (val != '') {
		elasticItems.forEach(function (element) {
			if (element.innerText.search(val) == -1) {
				element.classList.add('hide');
			}
			else {
				element.classList.remove('hide');
			}
		});
	}
	else {
		elasticItems.forEach(function (element) {
			element.classList.remove('hide');
		});
	}
}*/

/*function insertMark(string, pos, len){
	// Hello world
	// hello <mark>wo</mark>rld
	// hello+<mark>+wo+</mark>+rld
	return string.slice(0, pos)+string.slice(pos, pos+len)+string.slice(pos+len);
}*/

/*const buttonShovMore = document.querySelector('.botton_show_more_all_destinations');
const tableDestinations = document.querySelector('.table');

buttonShovMore.addEventListener("click", function (event) {
  tableDestinations.classList.toggle('_active');
  buttonShovMore.classList.toggle('_active');
});*/