import { HashRouter, Switch, Route } from './router';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CollectionPage from './pages/CollectionPage';
import BlogPage from './pages/BlogPage';
import ContentPages from './pages/ContentPages';
import ProductDetailPage from './pages/ProductDetailPage';
import SearchPage from './pages/SearchPage';

export default function App() {
  return (
    <CartProvider>
      <HashRouter>
        <Layout>
          <Switch>
            <Route path="/"                      component={HomePage} />
            <Route path="/search"                component={SearchPage} />
            <Route path="/collections/:slug"     component={CollectionPage} />
            <Route path="/blogs/journal/:slug?"  component={BlogPage} />
            <Route path="/pages/:slug"           component={ContentPages} />
            <Route path="/products/:handle"      component={ProductDetailPage} />
            <Route path="/cart"                  component={ContentPages} />
            <Route path="/account"               component={ContentPages} />
            <Route path="/account/login"         component={ContentPages} />
            <Route path="/account/register"      component={ContentPages} />
            <Route                               component={ContentPages} />
          </Switch>
        </Layout>
      </HashRouter>
    </CartProvider>
  );
}
