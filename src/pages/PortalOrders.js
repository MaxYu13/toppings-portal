import React, { useState, useEffect, useRef } from 'react';

import Amplify, { Auth, API, graphqlOperation } from 'aws-amplify';

import awsConfig from '../utils/awsConfig';
import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';
import * as subscriptions from '../graphql/subscriptions'

import bubbleIcon from '../assets/images/bubble-icon-2.svg';
import whiteCheckmark from '../assets/images/white-checkmark.svg';
import grayCheckmark from '../assets/images/gray-checkmark.svg';
import { listOrders } from '../../../toppings-portal/src/graphql/queries';
import { onCreateOrderItem } from '../../../toppings-portal/src/graphql/subscriptions';


function PortalOrders(props) {
  const [selectedOrder, selectOrder] = useState(null); 
  const [orders, setOrders] = useState({
    // New: [{id: 73, deliverer: "Patrick Star", customer: "Gary", tip: 0.00, instructions: "Meow", items: [{name: "Golden Loaf", price: 2.50}, {name: "Krabby Patty", price: 2.99}]}, 
    //       {id: 72, deliverer: "Plankton", customer: "Karen", tip: 2.00, instructions: "Give me the secret formula Mr. Krabs!", items: [{name: "Krabby Patty", price: 2.99}]}],
    // Preparing: [{id: 71, deliverer: "Triton", customer: "King Neptune", tip: 1.00, instructions: "Extra jelly please!", items: [{name: "Jelly Patty", price: 3.99}, {name: "Jelly Patty", price: 3.99}, {name: "Jelly Patty", price: 3.99}]}, 
    //             {id: 70, deliverer: "Princess Mindy", customer: "King Neptune", tip: 0.80, instructions: "", items: [{name: "Fried Oyster Skin", price: 0.99}, {name: "Golden Loaf", price: 2.50}]}],
    // Ready: [{id: 69, deliverer: "Larry the Lobster", customer: "Mrs. Puff", tip: 1.00, instructions: "", items: [{name: "Krabby Patty", price: 2.99}, {name: "Krabby Patty", price: 2.99}, {name: "Jelly Patty", price: 3.99}]}]
    New:[],
    Preparing:[],
    Ready:[]
  });
  useEffect(() => {
    getData();
    //updateData();
  }, []);

  function advanceOrder(order, currentStatus) {
    const ordersCopy = orders;
    ordersCopy[currentStatus] = ordersCopy[currentStatus].filter(item => item != order);
    if (currentStatus == "New") {
      ordersCopy["Preparing"].push(order)
    } else if (currentStatus == "Preparing") {
      ordersCopy["Ready"].push(order)
    }
    console.log(ordersCopy, ordersCopy[currentStatus])

    if (ordersCopy.New.length + ordersCopy.Preparing.length + ordersCopy.Ready.length <= 0) {
      selectOrder(null);
    }

    setOrders({... ordersCopy});
  }


  async function getData() {
    console.log('test')
    const orderList = [];
    const response = await API.graphql(graphqlOperation(onCreateOrderItem)).subscribe({
      next: (eventData) => {
        //console.log(eventData)
        let New = []
        const myOrder = eventData.value.data.onCreateOrderItem
        // if(myOrder.pickup === undefined || myOrder.customer === undefined || myOrder.order === undefined)
        // {
        //   console.log(myOrder.pickup + "pick")

        //   console.log(myOrder.customer + "cust")
        //   console.log(myOrder.order)
        //   return
        // }
        
        console.log(myOrder.itemName)
        console.log(myOrder)
        console.log(myOrder.customer)
        console.log(myOrder.price_before_reward)
        console.log(myOrder.order)
        
        if(myOrder.menuId === props.restaurant.id)
        {
          let foodItems = []
          myOrder.order.orderItems.items.forEach(foodItem =>{
                        let myFoodItem = {
                          name:foodItem.itemName,
                          price:foodItem.price_before_reward
                        }
                        foodItems.push(myFoodItem)
                      })
          let newOrder = {
            id: myOrder.id,
            deliverer: myOrder.order.pickup.deliverer.name,
            customer: myOrder.order.customer.name,
            tip: myOrder.order.tip,
            instructions: "",
            items: foodItems
          }
          console.log(newOrder.items.price)
          console.log(newOrder)
          New.push(newOrder)
        }
        New.forEach(order => {
          setOrders(oldMenuItems => ({
            ...oldMenuItems, New
            
          }));
        });
  }});
    
    // console.log(onCreateOrderItem)
    // console.log(response)
    
  }
  
  // async function getData() {
  //   setLoading(true);
  //   const response = await API.graphql(graphqlOperation(customQueries.listMenuCategories, { filter: { menuId: { eq: props.restaurant.id }}}));
  //   const menuCategoriesList = response.data.listMenuCategorys.items;
  //   menuCategoriesList.forEach(category => {
  //     setMenuItems(oldMenuItems => ({
  //       ...oldMenuItems,
  //       [category.name]: category.menuItems.items,
  //     }));
  //   });
  //   setLoading(false);
  // }
  // function getData() {
  //   API.graphql({ query: queries.listOrders }).then(({ data: { listOrders } }) => {

  //     // let restaurantOrders = []
  //     // //console.log(listOrders.items.length)
  //     // let y = listOrders.items.length
  //     // console.log(listOrders.items)
  //     // for(var x=0;x<15;x++)
  //     // {
        
  //     //   if(listOrders.items[x].restaurant.id === props.restaurant.id)
  //     //   {
  //     //     restaurantOrders.push(listOrders.items[x])
  //     //   }
  //     // }
  //     //console.log(listOrders.items)
  //     let actualOrders = listOrders.items.filter(item => item.restaurant != null)
  //     //console.log(actualOrders)
  //     let restaurantOrders = actualOrders.filter(item => item.restaurant.id == props.restaurant.id);
  //     //console.log(listOrders)
  //     //console.log(restaurantOrders[0].restaurant.id)
  //     console.log(restaurantOrders)
  //     //console.log(listOrders.items[0].restaurant.id)
  //     //console.log(listOrders)
  //     //console.log(orders)
  //     //console.log("test")
  //     // restaurantOrders.forEach(orders => {
  //     //   API.graphql({ query: queries.listMenuItems }).then(({ data: { listMenuItems } }) => {
  //     //     let restaurantMenuItems = listMenuItems.items.filter(item => item.menuId == props.restaurant.id);
  //         //console.log(restaurantMenuItems)
  //         //console.log('test')
  //         let finalOrders = restaurantOrders.filter(item => item.orderItems.items.length !== 0)
  //         console.log(finalOrders)
          
  //         let New = []
  //         restaurantOrders.forEach(newOrder => {
  //           let foodItems = []
  //           newOrder.orderItems.items.forEach(foodItem =>{
  //             let myFoodItem = {
  //               name:foodItem.itemName,
  //               price:foodItem.price_before_reward
  //             }
  //             foodItems.push(myFoodItem)
  //           })
  //           //console.log(foodItems)
  //         let myOrder = {
  //           id: newOrder.id, deliverer: newOrder.pickup.deliverer.name, customer: newOrder.customer.name, tip: newOrder.tip, instructions: "", items: foodItems
  //         }
  //         if(myOrder.items.length !==0 )
  //         {
  //           console.log("test")
  //         New.push(myOrder)
  //         }
  //       }
  //         )
  //         //console.log(incomingOrders)
  //         //id: 73, deliverer: "Patrick Star", customer: "Gary", tip: 0.00, instructions: "Meow", items: [{name: "Golden Loaf", price: 2.50}, {name: "Krabby Patty", price: 2.99}]}
  //         setOrders(oldOrders => ({
  //           ...oldOrders,
  //           New,

  //         //});
  //         //setMenuItems(oldMenuCategories => ({
  //           //           ...oldMenuCategories,
  //           //           [category.name]: restaurantMenuItems
  //           //
  //                  }));
  //       // }).catch((error) => {
  //       //   console.log(error);
  //       // }); 
  //      //});
  //   }).catch((error) => {
  //     console.log(error);
  //   });
  // }
  // async function updateData(){
  //   setLoading(true);
  //   const response = await API.graphql({subsciption: subscriptions}).then(({ data: { listOrders } }) => {
  //       const orders = response.data.listOrders.items
  //   },
  //   setLoading(false)
  // }

  // async function updateData() {
  //   console.log('test')
  //   const response = await API.graphql({subscription:subscriptions.onCreateOrderItem}).then({data:subscriptions.onCreateOrderItem});
  //   const orderList = response.data.onCreateOrderItem.items;
  //   console.log(orderList)
  //   orderList.forEach(order => {
  //     setOrders(oldMenuItems => ({
  //       ...oldMenuItems,
        
  //     }));
  //   });
    
  // }

  // function getData() {
  //   API.graphql({ query: queries.listVendorRewards }).then(({ data: { listVendorRewards } }) => {
  //     let restaurantRewards = listVendorRewards.items.filter(reward => reward.menuId == props.restaurant.id);
  //     restaurantRewards.forEach(reward => {
  //       API.graphql({ query: queries.listMenuItems }).then(({ data: { listMenuItems } }) => {
  //         console.log(listMenuItems)
  //         let restaurantMenuItem = listMenuItems.items.filter(item => item.menuId == props.restaurant.id && item.name == reward.itemName);
  //         setRewardItems({
  //           Rewards: [...rewardItems.Rewards, {
  //             ...reward,
  //             description: restaurantMenuItem[0].description
  //           }]
  //         });
  //       }).catch((error) => {
  //         console.log(error);
  //       });
  //     });
  //     console.log(restaurantRewards)
  //     setRewardItems({
  //       Rewards: restaurantRewards
  //     });
  //   }).catch((error) => {
  //     console.log(error);
  //   });
  // }

  // function getData() {
  //   API.graphql({ query: queries.listMenuCategorys }).then(({ data: { listMenuCategorys } }) => {
  //     let restaurantMenuCategories = listMenuCategorys.items.filter(category => category.menuId == props.restaurant.id);
  //     restaurantMenuCategories.forEach(category => {
  //       let restaurantMenuItems = [];
  //       API.graphql({ query: queries.listMenuItems }).then(({ data: { listMenuItems } }) => {
  //         restaurantMenuItems = listMenuItems.items.filter(item => item.menuId == props.restaurant.id && item.menuCategoryName == category.name);
  //         setMenuItems(oldMenuCategories => ({
  //           ...oldMenuCategories,
  //           [category.name]: restaurantMenuItems
  //         }));
  //       }).catch((error) => {
  //         console.log(error);
  //       });
  //     });
  //   }).catch((error) => {
  //     console.log(error);
  //   });
  //}

  return (
    <article className="portal-orders-container">
      {Object.keys(orders).length > 0 ?
        <div className="portal-orders-subcontainer">
          <div className="orders-list">
            <header>
              <span className="orange-subheading">1/27/21</span>
              <button className="tag">Receiving New Orders <img className="checkmark" src={whiteCheckmark} /></button>
            </header>
            {Object.keys(orders).map((category =>
                <div key={category} className="menu-category-container">
                  <span className="order-category">{category}</span>

                  {orders[category].length > 0 ?
                    orders[category].map(order => 
                      <div key={order.id} className={selectedOrder == order ? "order-container active" : "order-container"} onClick={() => selectOrder(order)}>
                        <span>#{order.id}</span> 
                        <span>{category == "New" ? <button>New</button> : ""}</span>
                      </div>
                    )
                  : 
                    <div className="empty-order-container">
                      {category == "New" ? "No new orders." : category == "Preparing" ? "No orders are being prepared." : category == "Ready" ? "No orders are ready." : ""}
                    </div>
                  }
                </div> 
              ))}
          </div>
          <div className="portal-orders-info">
            {selectedOrder != null ? 
              <div>
                <header>
                  <span className="subheading">Items <br />
                    <span className="blue-subheading">{selectedOrder.items.length}</span>
                  </span>
                  
                  <span className="subheading">Deliverer <br />
                    <span className="blue-subheading">{selectedOrder.deliverer}</span>
                  </span>
                  
                  <span className="subheading">Customer <br />
                    <span className="blue-subheading">{selectedOrder.customer}</span>
                  </span>
                </header>

                <div className="order-details">
                  {orders.Preparing.indexOf(selectedOrder) > -1 ? 
                    <div className="order-delivery-time">
                      <span className="blue-subheading">Estimated Time:</span>
                      <button className="blue">15 Minutes</button>
                    </div>
                  : ""}

                  {orders.Ready.indexOf(selectedOrder) > -1 ? 
                    <div className="order-delivery-time">
                      <span className="blue-subheading">Waiting for delivery confirmation.</span>
                    </div>
                  : ""}

                  <span className="heading">Order #{selectedOrder.id}</span>
                  <hr className="short" />

                  <div className="order-bill">
                    {selectedOrder.items.map((item => 
                      <div key={Math.random()} className="order-item">
                        <span className="order-item-name">{item.name}</span>
                        <span className="order-item-price">{item.price}</span>
                      </div>
                    ))}
                    <br />
                    <div className="order-tax-tip">
                      <span className="order-item-name">Tax</span>
                      <span className="order-item-price">${(Math.round(15 * selectedOrder.items.reduce((a, b) => a + (b.price || 0), 0)) * 0.01).toFixed(2)}</span>
                    </div>

                    <div className="order-tax-tip">
                      <span className="order-item-name">Tip</span>
                       <span className="order-item-price">${selectedOrder.tip}</span> {/*add back in to fixed */}
                    </div>
                    <br />
                    <div className="order-total">
                      <span className="order-item-name">Total</span>
                      <span className="order-item-price">${(selectedOrder.tip + (Math.round(15 * selectedOrder.items.reduce((a, b) => a + (b.price || 0), 0)) * 0.01) + selectedOrder.items.reduce((a, b) => a + (b.price || 0), 0)).toFixed(2)}</span>
                    </div>
                    <br />

                    <hr />
                    <span className="subheading">Payment Confirmed <img className="checkmark" src={grayCheckmark} /></span>
                    <hr />
            
                    <div className="order-instructions">
                      <span className="heading">Special Instructions</span>
                      <hr className="short" />
                      <span>{selectedOrder.instructions.length > 0 ? "\"" + selectedOrder.instructions + "\"" : "None"}</span>
                    </div>

                    <button className="gray">Report Issue</button>
                    {orders.New.indexOf(selectedOrder) > -1 ? 
                      <button className="orange" onClick={() => advanceOrder(selectedOrder, "New")}>Confirm Order</button>
                    : orders.Preparing.indexOf(selectedOrder) > -1 ? 
                      <button className="orange" onClick={() => advanceOrder(selectedOrder, "Preparing")}>Ready for Pickup</button>
                    : orders.Ready.indexOf(selectedOrder) > -1 ? 
                      <button className="orange" onClick={() => advanceOrder(selectedOrder, "Ready")}>Delivered</button>
                    : ""}
                  </div>
                </div>
                </div>
            : ""}
          </div>
        </div>
      :
        <header>
          <img className="portal-empty-image" src={bubbleIcon} />
          <span className="subheading">You have no active orders.</span>
          <b>Orders placed through the Toppings app today <br /> will appear here.</b>
        </header>
      }
    </article>
  );
}

export default PortalOrders;