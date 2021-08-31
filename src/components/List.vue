<template>
  <div class="container">
    <div class="container-2">
      <div class="header">
        <button>
          <h3>Contacts</h3>
        </button>
      </div>
      <div class="body">
        <ul>
          <li
            v-for="contact in contacts"
            :key="contact.id"
            @click="$emit('openChat', contact.id)"
          >
            <div>
              <div class="img">
                <img :src="contact.photoUrl" alt="" />
              </div>
              <div class="contact">
                {{ contact.displayName }}
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div class="header">
        <button>
          <h3>Groups</h3>
        </button>
      </div>
      <div class="body" v-if="groups">
        <ul>
          <li
            v-for="group in groups"
            :key="group.id"
            @click="$emit('showGroup', group.id)"
          >
            <div>
              <div class="img">
                <img :src="group.photoUrl" alt="" />
              </div>
              <div class="contact">
                {{ group.name }}
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div class="header" v-if="contactRequests.length">
        <button @click="showRequests">
          <h3>Contact Requests</h3>
        </button>
      </div>
      <div class="body" v-if="showContactRequests">
        <ul>
          <li v-for="(user, index) in contactRequestsData" :key="user.userId">
            <div class="img"><img :src="user.photoUrl" alt="" /></div>
            <div class="contact-2">
              <router-link
                class="link"
                :to="{
                  name: 'Profile',
                  params: { id: user.userId },
                }"
                >{{ user.displayName }}</router-link
              >
              <button @click="addContact(user.userId, index)">Add</button>
              <button @click="ingoreRequest(user.userId, index)">Remove</button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { projectFirestore } from "../firebase/config";

export default {
  props: ["id"],
  data() {
    return {
      showContactRequests: false,
      contactRequestsData: [],
      contactRequests: [],
      contacts: [],
      groups: [],
    };
  },
  methods: {
    showRequests() {
      this.showContactRequests = !this.showContactRequests;
      console.log(this.contactRequestsData);
      if (!this.contactRequestsData.length) {
        for (let i = 0; i < this.contactRequests.length; i++) {
          projectFirestore
            .collection("user")
            .doc(this.contactRequests[i].userId)
            .get()
            .then((doc) => {
              this.contactRequestsData.push({
                photoUrl: doc.data().photoUrl,
                displayName: doc.data().displayName,
                userId: doc.id,
              });
            });
          console.log(this.contactRequestsData);
        }
      }
    },
    addContact(id, index) {
      projectFirestore
        .collection("user")
        .doc(id)
        .collection("contact")
        .doc(this.$store.getters.getUser.uid)
        .update({
          contact: true,
        });
      projectFirestore
        .collection("user")
        .doc(this.$store.getters.getUser.uid)
        .collection("contactRequests")
        .doc(id)
        .delete();
      const ref = projectFirestore
        .collection("user")
        .doc(this.$store.getters.getUser.uid)
        .collection("contact")
        .doc(id);
      ref.get().then(() => {
        ref.set({
          contact: true,
        });
        this.contactRequestsData.splice(index, 1);
        this.contactRequests.splice(index, 1);
      });
    },
    ingoreRequest(id, index) {
      projectFirestore
        .collection("user")
        .doc(this.$store.getters.getUser.uid)
        .collection("contactRequests")
        .doc(id)
        .delete();
      projectFirestore
        .collection("user")
        .doc(id)
        .collection("contacts")
        .doc(this.$store.getters.getUser.uid)
        .delete();
      this.contactRequests.splice(index, 1);
      this.contactRequestsData.splice(index, 1);
    },
  },
  created() {
    projectFirestore
      .collection("user")
      .doc(this.$store.getters.getUser.uid)
      .collection("contact")
      .get()
      .then((res) => {
        for (let i = 0; i < res.docs.length; i++) {
          projectFirestore
            .collection("user")
            .doc(res.docs[i].id)
            .get()
            .then((resUser) => {
              this.contacts.push({ ...resUser.data(), id: res.docs[i].id });
            });
        }
      });
    projectFirestore
      .collection("user")
      .doc(this.$store.getters.getUser.uid)
      .collection("groups")
      .get()
      .then((res) => {
        for (let i = 0; i < res.docs.length; i++) {
          projectFirestore
            .collection("groups")
            .doc(res.docs[i].id)
            .get()
            .then((resGroup) => {
              this.groups.push({ ...resGroup.data(), id: res.docs[i].id });
            });
        }
      });
    projectFirestore
      .collection("user")
      .doc(this.$props.id)
      .collection("contactRequests")
      .orderBy("timestamp")
      .get()
      .then((res) => {
        if (!res.empty) {
          for (var i = res.docs.length - 1; i >= 0; i--) {
            this.contactRequests.push({
              ...res.docs[i].data(),
              userId: res.docs[i].id,
            });
          }
        }
      });
  },
};
</script>


<style scoped lang='scss'>
@import "../scss/_variables.scss";
.container {
  position: fixed;
  width: inherit;
  // background: red;
  .container-2 {
    color: white;
    background: #444;
    position: relative;
    width: 90%;
    margin-left: auto;
    margin-right: auto;
    .header {
      button {
        width: 100%;
        padding: 1rem 0;
        background: $color6;
        h3 {
          color: white;
          margin: 0;
        }
      }
    }
    .body {
      ul {
        li {
          height: 3.5rem;
          padding: 0.5rem;
          &:hover {
            background: black;
          }
          .img {
            float: left;
            img {
              height: 2.5rem;
              width: 2.5rem;
            }
          }
          .contact {
            display: inline-block;
            height: 100%;
            padding-left: 0.75rem;
          }
          .contact-2 {
            display: inline-block;
            padding-left: 0.75rem;
            .link {
              display: block;
              color: white;
              text-decoration: none;
            }
            button {
              margin-top: 0.25rem;
              margin-right: 0.5rem;
            }
          }
        }
      }
    }
  }
}
</style>