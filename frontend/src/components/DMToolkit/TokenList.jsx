import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/TokenList.css';

const TokenList = ({ user }) => {
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const res = await axios.get('/api/dmtoolkit', {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });

        const tokenItems = res.data.filter(item =>
          ['Token', 'NPC', 'Monster'].includes(item.toolkitType)
        );

        setTokens(tokenItems);
        console.log('Loaded Tokens:', tokenItems); // ✅ Dev debug
      } catch (err) {
        console.error('Failed to fetch tokens:', err);
      }
    };

    fetchTokens();
  }, [user.token]);

  const getImage = (item) => {
    const c = item.content || {};
  
    return (
      c.avatar ||
      c.imageUrl ||
      c.tokenImage ||
      c.img ||
      c.image || // ✅ <== Add this line
      null       // ✅ Prevents passing empty string to <img src="">
    );
  };

  return (
    <div className="token-list">
      {tokens.map(token => (
        <div
          key={token._id}
          className="token-card"
          title={`Size: ${token.content?.size || 'Default'}`}
        >
          <img src={getImage(token)} alt={token.title} />
          <span>{token.title}</span>
        </div>
      ))}
    </div>
  );
};

export default TokenList;
