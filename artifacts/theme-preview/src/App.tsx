import { HashRouter, Switch, Route } from './router';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CollectionPage from './pages/CollectionPage';
import BlogPage from './pages/BlogPage';
import ContentPages from './pages/ContentPages';

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Switch>
          <Route path="/"                      component={HomePage} />
          <Route path="/collections/:slug"     component={CollectionPage} />
          <Route path="/blogs/journal/:slug?"  component={BlogPage} />
          <Route path="/pages/:slug"           component={ContentPages} />
          <Route path="/products/:handle"      component={ContentPages} />
          <Route path="/cart"                  component={ContentPages} />
          <Route path="/account"               component={ContentPages} />
          <Route path="/account/login"         component={ContentPages} />
          <Route path="/account/register"      component={ContentPages} />
          <Route                               component={ContentPages} />
        </Switch>
      </Layout>
    </HashRouter>
  );
}
