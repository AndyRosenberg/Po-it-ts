import React from 'react';
import {
  Box,
  Flex,
  Text,
  Avatar,
  Spinner,
  Link,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useFollowers, useFollowing } from '../hooks/useFollows';
import FollowButton from './FollowButton';

interface FollowsListProps {
  userId: string;
  username: string;
}

const FollowsList: React.FC<FollowsListProps> = ({ userId, username }) => {
  const { data: followers, isLoading: followersLoading } = useFollowers(userId);
  const { data: following, isLoading: followingLoading } = useFollowing(userId);

  return (
    <Tabs isFitted variant="enclosed">
      <TabList mb="1em">
        <Tab>Followers ({followers?.length || 0})</Tab>
        <Tab>Following ({following?.length || 0})</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          {followersLoading ? (
            <Flex justify="center" my={8}>
              <Spinner />
            </Flex>
          ) : followers?.length === 0 ? (
            <Text textAlign="center" color="gray.500">
              {username} doesn't have any followers yet
            </Text>
          ) : (
            followers?.map(follower => (
              <Flex key={follower.id} justify="space-between" align="center" mb={3} p={2} borderBottom="1px" borderColor="gray.100">
                <Flex align="center">
                  <Avatar size="sm" src={follower.profilePic} mr={3} />
                  <Link as={RouterLink} to={`/profile/${follower.id}`} fontWeight="medium">
                    {follower.username}
                  </Link>
                </Flex>
                <FollowButton userId={follower.id} size="sm" />
              </Flex>
            ))
          )}
        </TabPanel>
        <TabPanel>
          {followingLoading ? (
            <Flex justify="center" my={8}>
              <Spinner />
            </Flex>
          ) : following?.length === 0 ? (
            <Text textAlign="center" color="gray.500">
              {username} isn't following anyone yet
            </Text>
          ) : (
            following?.map(follow => (
              <Flex key={follow.id} justify="space-between" align="center" mb={3} p={2} borderBottom="1px" borderColor="gray.100">
                <Flex align="center">
                  <Avatar size="sm" src={follow.profilePic} mr={3} />
                  <Link as={RouterLink} to={`/profile/${follow.id}`} fontWeight="medium">
                    {follow.username}
                  </Link>
                </Flex>
                <FollowButton userId={follow.id} size="sm" />
              </Flex>
            ))
          )}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default FollowsList;