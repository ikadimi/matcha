Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
        <div class="product">
        <div class="product-image">
            <img width="400" height="400" v-bind:src="image">
        </div>
        <div class="product-info">
            <h1>{{ title }}</h1>
            <p v-if="inventory > 10">In Stock</p>
            <p v-else-if="inventory <= 10 && inventory > 0">Almost solde out</p>
            <p v-else>Out of Stock</p>
            <p>User is premium: {{ premium }} </p>
        </div>
        <ul>
            <li v-for="detail in details">{{ detail }}</li>
        </ul>

        <div v-for="(variant ,index) in variants" :key="variant.variantId" class="color-box" 
        :style="{ backgroundColor: variant.variantColor}" @mouseover="updateProduct(index)">
        </div>

        <button v-on:click="addToCart" :disabled="!inStock" :class="{ disabledButton: !inStock}">Add to Cart</button>

        </div>
    `,
    data(){
     return {
            brand: 'Vue Mikaso',
            product: 'T9achr',
            selectedVariant: 0,
            inventory: 11,
            details: ["45.9999999% chamch", "56.222222 olimac", "SExy", "la 7chuma"],
            variants: [
                {
                    variantId : 1256,
                    variantColor: "green",
                    variantQuantity: 210,
                    variantImage: 'data:image/jpeg;base64,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'
                },
                {
                    variantId : 125-9,
                    variantColor: "blue",
                    variantQuantity: 0,
                    variantImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Garant.jpg/280px-Garant.jpg'
                }
            ],
        }},
        methods: {
            addToCart: function() {
                this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
            },
            updateProduct: function(index) {
                this.selectedVariant = index
                console.log(index)
            }
        },
        computed: {
            title() {
                return this.brand + ' ' + this.product
            },
            image() {
                return this.variants[this.selectedVariant].variantImage
            },
            inStock() {
                return this.variants[this.selectedVariant].variantQuantity
            }
        }
})
var    app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
        }
    }
})