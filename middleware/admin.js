export default function({ store, redirect }) {
  // If the user is not authenticated
  if (!store.state.authUser) {
    return redirect('/login')
  }
  if (!store.state.authUser.isAdmin) {
    return redirect('/dashboard')
  }
}
