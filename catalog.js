      const ItemComponent = {
      props: ['id', 'title', 'price', 'img'],
      template: `<div class="item">
          <h3>{{title}}</h3>
          <img width="100" :src="img" />
          <p>{{price}}</p>
          <button class="buy" @click="handleBuyClick(id)">Buy</button>
        </div>`,        
      methods: {
        handleBuyClick(id) {          
           this.$emit('buy', id);
        }
      }
    };

    const ItemsListComponent = {
      props: ['items'],
      // : "новосозданное свойтство" = ""передаваемое(от привязки) значение"" ????? подробнее на 1-30-00 видео урока 6
      template: `<div>
        <h2>Каталог товаров</h2>        
        <item-component
          v-if="items.length"
          v-for="item in items"
          :key="item.id"
          :id="item.id"
          :title="item.title"
          :price="item.price"
          :img="item.img"          
          @buy="handleBuyClick(item)"
        ></item-component>
        <div v-if="!items.length">
        Список товаров пуст
      </div>
      </div>`,
      /// Разве методы могут быть у компонентов? -- Да, могут.
      /// Что такое emit и что такое $ ????? this.$emit() - запись-связка с функцией обработчиком handleBuyClick
      // из основного приложения, а ('buy', item) - событие, на которое запускается обработчик и параметр, который в
      // него передаётся
      /// В чём различие между методом handleBuyClick в ItemsListComponent и handleBuyClick в ItemComponent?
      // Почему именно такая запись, а не как в родительском Vue? Почему запись из родительского Vue не удалена? 
      // Разве они не дублируют друг друга? Не дублируют, здесь запись-связка, а в осн.приложении 
      // непосредственно код функции-обработчика      
      /// Что такое @buy? (стр. 29 кода) Это собственное (самовыдуманное) событие, созданное конкретно 
      // в этом и только для этого кода
      methods: {
        handleBuyClick(item) {
          this.$emit('buy', item);
        }
      },
      components: {
        'item-component': ItemComponent,
      },
    };

    const SearchComponent = {
      template:`<div>
                    <input type="text" v-model="query"><button @click="handleSearchClick">Найти</button>
                </div>`,
      data () {
        return {
          query: '',
        }
      },
      methods: {
        handleSearchClick(){
          this.$emit('search', this.query);
        }
      }
    };

    const CartItemComponent = {
      props: ['id', 'title', 'qty', 'price'],
      template:`<li>
                    <h3>{{title}}</h3>
                   // <input class="qty" type="number" v-model="qty"  @input="" />
                   // <button @click="handleDeleteClick()">x</button>
            </li>`,
      methods: {
        handleDeleteClick(){
          this.$emit('deleted', )
        },
        handleQuantityChange(){
          this.$emit('changed', )
        }
      }
    };

    const CartComponent = {
      props: ['items'],
      template: `<div>
        <h2>Корзина</h2>
        <div class="cart">
          <ul>
          <cart-item-component v-for="item in items" 
          :id="item.id"
          :key="item.id"
          :title="item.title"
          :price="item.price"></cart-item-component>  
          </ul>
        </div>
        <div class="total">Общая стоимость товаров: {{total}} рублей</div>
                </div>`,
      methods: {

      },
      computed: {
        total() {
          return this.items.reduce((acc, item) => acc + item.qty * item.price, 0);
        },
      },
      components: {
        'cart-item-component': CartItemComponent
      }
    };

    const app = new Vue({
      el: '#root',
      data: {
        items: [],
        cart: [],
        query: '',
        isCartVisible: true,
      },
      methods: {
        handleBuyClick(item) {
          // Определяем, что за элемент (item) надо внести в корзину
          const cartItem = this.cart.find((cartItem) => +cartItem.id === +item.id);

          // Если такой элемент существует, то прибавляем к существующему элементу +1 к количеству
          if (cartItem) {
            fetch(`/cart/${item.id}`, {
              method: 'PATCH',
              body: JSON.stringify({ qty: cartItem.qty + 1 }),
              headers: {
                'Content-type': 'application/json',
              }
            }).then(() => {
              cartItem.qty++;
            });
          // Если не существует, то добавляем его в корзину с количеством, равным 1
          } else {
            fetch('/cart', {
              method: 'POST',
              body: JSON.stringify({ ...item, qty: 1 }),
              headers: {
                'Content-type': 'application/json',
              },
            }).then(() => {
              this.cart.push({ ...item, qty: 1 });
            });
          }
        },
        handleItemClick(title) {
          console.log(title, 'clicked');
        },
        handleDeleteClick(id) {
          const cartItem = this.cart.find((cartItem) => +cartItem.id === +id);

          if (cartItem && cartItem.qty > 1) {
            fetch(`/cart/${id}`, {
              method: 'PATCH',
              body: JSON.stringify({ qty: cartItem.qty - 1 }),
              headers: {
                'Content-type': 'application/json',
              }
            }).then(() => {
              cartItem.qty--;
            });
          } else {
            if (confirm('Вы действительно хотите удалить последний товар?')) {
              fetch(`/cart/${id}`, {
                method: 'DELETE',
              }).then(() => {
                this.cart = this.cart.filter((item) => item.id !== id);
              });
            }
          }
        },
        onQueryChanged(query) {
          this.query = query;
        },
        toggleCart() {
          this.isCartVisible = !this.isCartVisible;
        },
        handleCartChange(){}
      },
      mounted() {
        fetch('/goods')
          .then(response => response.json())
          .then((goods) => {
            this.items = goods;
          });

        fetch('/cart')
          .then(response => response.json())
          .then((cart) => {
            this.cart = cart;
          });
      },
      computed: {
        filteredItems() {
          return this.items.filter((item) => {
            const regexp = new RegExp(this.query, 'i');

            return regexp.test(item.title);
          });
        }
      },
      components: {
        'items-list-component': ItemsListComponent,
        'search-component': SearchComponent,
        'cart-component': CartComponent
      },
    });
