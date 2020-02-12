<template>
  <div>
    <b-table striped hover :head-variant="headVariant" :fields="fields" :items="tb_items">
      <template v-slot:cell(delete)="row">
        <b-button size="sm" @click="del(row.item, row.index, $event.target)" class="mr-1">
          delete
        </b-button>
      </template>
    </b-table>

    <b-toast id="toastinfo1" toaster="b-toaster-top-left" title="Info">
      User was deleted.
    </b-toast>
  </div>
</template>



<script>
import { mapState, mapActions, mapGetters } from 'vuex';

export default {
  data() {
    return {
      fields: ['id', 'firstName', 'lastName', 'delete'],
      items_test: [
        { age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
        { age: 21, first_name: 'Larsen', last_name: 'Shaw' },
        { age: 89, first_name: 'Geneva', last_name: 'Wilson' },
        { age: 38, first_name: 'Jami', last_name: 'Carney' }
      ],
      headVariant: 'dark'
    }
  },
  computed: {
      ...mapState({
        account: state => state.account,
        users: state => state.users.all
      }),
      ...mapGetters('users', {
          tb_items: 'usersTable'
      })
  },
   methods: {
     ...mapActions('users', {
            deleteUser: 'delete'
      }),
      del(item, index, button) {
        this.deleteUser(item.id);
        this.$bvToast.show('toastinfo1');
      },
   }
}
</script>